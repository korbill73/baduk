import { GoBoard } from '../core/GoBoard';
import type { Point, StoneColor, RankInfo, AiRecommendation } from '../types/go';
import { JosekiBook } from './JosekiBook';
import { Evaluator } from './Evaluator';
import { TacticalSolver } from './TacticalSolver';

export class MCTSEngine {
  static runSearch(
    board: GoBoard,
    aiColor: StoneColor,
    rankInfo: RankInfo
  ): { move: Point | null; recommendations: AiRecommendation[] } {
    if (!aiColor) return { move: null, recommendations: [] };

    const sims = rankInfo?.mctsSimulations || 1;
    const rankName = rankInfo?.name || '1수 읽기 (1회 연산)';
    const openingRate = rankInfo?.openingBookRate ?? 0.1;

    // 0. EMERGENCY TACTICAL OVERRIDE: Save dying stones & Capture enemy Ataris
    const urgentMoves = TacticalSolver.findUrgentTacticalMoves(board, aiColor);
    if (urgentMoves.length > 0) {
      const topUrgent = urgentMoves[0];
      // High level AI executes emergency Atari saves always; lower levels execute at lower rates
      const urgentExecuteRate = sims <= 2 ? 0.4 : (sims <= 5 ? 0.7 : 0.98);
      if (topUrgent.priorityScore >= 9000 && Math.random() < urgentExecuteRate) {
        const rec: AiRecommendation = {
          point: topUrgent.point,
          rank: 1,
          winRateChange: +8.5,
          explanation: topUrgent.reason,
          category: topUrgent.type === 'SAVE_ATARI' ? '방어' : '공격'
        };
        return { move: topUrgent.point, recommendations: [rec] };
      }
    }

    // 1. Check Joseki / Opening Book only if openingRate condition passes (Beginners get natural beginner moves)
    if (Math.random() < openingRate) {
      const opening = JosekiBook.getOpeningMove(board.size, board.grid, aiColor);
      if (opening) {
        const rec: AiRecommendation = {
          point: opening.point,
          rank: 1,
          winRateChange: +2.5,
          explanation: `[교과서 포석/정석] ${opening.comment}`,
          category: '정석'
        };
        return { move: opening.point, recommendations: [rec] };
      }
    }

    const validMoves = board.getValidMovesFast(aiColor);
    if (validMoves.length === 0) {
      return { move: null, recommendations: [] };
    }

    // 2. Evaluate and score valid moves using Evaluator with user's rank
    const candidateScores: { point: Point; heuristicScore: number }[] = [];
    for (const pt of validMoves) {
      const score = Evaluator.evaluateMovePattern(board, pt.x, pt.y, aiColor, rankName);
      if (score > -300) {
        candidateScores.push({ point: pt, heuristicScore: score });
      }
    }

    if (candidateScores.length === 0) {
      return { move: null, recommendations: [] };
    }

    candidateScores.sort((a, b) => b.heuristicScore - a.heuristicScore);
    const candidateLimit = sims <= 2 ? 6 : (sims <= 5 ? 10 : 16);
    const topCandidates = candidateScores.slice(0, Math.min(candidateLimit, candidateScores.length));

    const enemyColor: StoneColor = aiColor === 'black' ? 'white' : 'black';
    const evaluatedCandidates: {
      point: Point;
      totalScore: number;
      explanation: string;
      category: '실리' | '세력' | '공격' | '방어' | '끝내기' | '정석';
    }[] = [];

    // 3. Minimax Lookahead - Depth adjusts by simulation level
    for (const cand of topCandidates) {
      const simBoard = new GoBoard(board.size, false);
      simBoard.grid = board.cloneGrid(board.grid);
      simBoard.turn = board.turn;
      simBoard.capturesBlack = board.capturesBlack;
      simBoard.capturesWhite = board.capturesWhite;
      simBoard.koPoint = board.koPoint ? { ...board.koPoint } : null;

      simBoard.playMove(cand.point.x, cand.point.y, aiColor);

      const staticBalance = Evaluator.evaluateBoardState(simBoard, aiColor);

      // Higher levels compute opponent counter-moves; lower levels evaluate simpler static balance
      let worstCounterBalance = staticBalance;

      if (sims >= 5) {
        const enemyMoves = simBoard.getValidMovesFast(enemyColor);
        const enemyCandidates: { pt: Point; score: number }[] = [];
        for (const ePt of enemyMoves) {
          const eScore = Evaluator.evaluateMovePattern(simBoard, ePt.x, ePt.y, enemyColor, rankName);
          if (eScore > -200) {
            enemyCandidates.push({ pt: ePt, score: eScore });
          }
        }
        enemyCandidates.sort((a, b) => b.score - a.score);
        const topEnemy = enemyCandidates.slice(0, Math.min(sims <= 15 ? 3 : 6, enemyCandidates.length));

        for (const eCand of topEnemy) {
          const enemySimBoard = new GoBoard(simBoard.size, false);
          enemySimBoard.grid = simBoard.cloneGrid(simBoard.grid);
          enemySimBoard.turn = simBoard.turn;
          enemySimBoard.capturesBlack = simBoard.capturesBlack;
          enemySimBoard.capturesWhite = simBoard.capturesWhite;
          enemySimBoard.koPoint = simBoard.koPoint ? { ...simBoard.koPoint } : null;

          enemySimBoard.playMove(eCand.pt.x, eCand.pt.y, enemyColor);
          const balanceAfterCounter = Evaluator.evaluateBoardState(enemySimBoard, aiColor);
          if (balanceAfterCounter < worstCounterBalance) {
            worstCounterBalance = balanceAfterCounter;
          }
        }
      }

      const finalScore = cand.heuristicScore * 0.45 + worstCounterBalance * 0.55;

      let category: '실리' | '세력' | '공격' | '방어' | '끝내기' = '실리';
      if (cand.heuristicScore > 1500) category = '방어';
      else if (cand.heuristicScore > 150) category = '공격';
      else if (cand.point.x >= 3 && cand.point.x <= board.size - 4 && cand.point.y >= 3 && cand.point.y <= board.size - 4) category = '세력';

      evaluatedCandidates.push({
        point: cand.point,
        totalScore: finalScore,
        explanation: `${rankName} 수읽기 (평가점: ${Math.round(finalScore)})`,
        category
      });
    }

    evaluatedCandidates.sort((a, b) => b.totalScore - a.totalScore);

    // 4. BEGINNER-FRIENDLY SOFTMOVE INJECTION based on simulation level
    let chosenIndex = 0;
    const rand = Math.random();

    if (sims === 1) {
      // 1회 연산 (18급 극초보): 70% 확률로 2~4위 후보 선택 (인간적인 초보 수)
      if (rand < 0.70 && evaluatedCandidates.length >= 2) {
        chosenIndex = Math.min(evaluatedCandidates.length - 1, Math.floor(Math.random() * 3) + 1);
      }
    } else if (sims === 2) {
      // 2회 연산 (17급 초보): 55% 확률로 2~3위 후보 선택
      if (rand < 0.55 && evaluatedCandidates.length >= 2) {
        chosenIndex = Math.min(evaluatedCandidates.length - 1, Math.floor(Math.random() * 2) + 1);
      }
    } else if (sims === 3) {
      // 3회 연산 (16급 기초): 40% 확률로 2위 후보 선택
      if (rand < 0.40 && evaluatedCandidates.length >= 2) {
        chosenIndex = 1;
      }
    } else if (sims === 4) {
      // 4회 연산 (15급 기초+): 25% 확률로 2위 후보 선택
      if (rand < 0.25 && evaluatedCandidates.length >= 2) {
        chosenIndex = 1;
      }
    } else if (sims === 5) {
      // 5회 연산 (14급): 15% 확률로 2위 후보 선택
      if (rand < 0.15 && evaluatedCandidates.length >= 2) {
        chosenIndex = 1;
      }
    }

    const selectedCand = evaluatedCandidates[chosenIndex] || evaluatedCandidates[0];

    const recommendations: AiRecommendation[] = evaluatedCandidates.slice(0, 3).map((item, idx) => {
      const scoreDiff = item.totalScore - (evaluatedCandidates[1]?.totalScore || item.totalScore);
      const winRateChange = Math.min(5.0, Math.max(0.2, Math.round(scoreDiff * 0.1 * 10) / 10));
      return {
        point: item.point,
        rank: idx + 1,
        winRateChange: idx === 0 ? winRateChange : -winRateChange,
        explanation: item.explanation,
        category: item.category
      };
    });

    return {
      move: selectedCand ? selectedCand.point : null,
      recommendations
    };
  }
}
