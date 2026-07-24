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

    const sims = rankInfo?.mctsSimulations ?? 1;
    const rankName = rankInfo?.name || '1수 읽기 (1회 연산)';
    const openingRate = rankInfo?.openingBookRate ?? 0.1;

    // 0. EMERGENCY TACTICAL OVERRIDE: Save dying stones & Capture enemy Ataris (100% Perfect Tactical Defense)
    const urgentMoves = TacticalSolver.findUrgentTacticalMoves(board, aiColor);
    if (urgentMoves.length > 0) {
      const topUrgent = urgentMoves[0];
      if (topUrgent.priorityScore >= 9000) {
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

    // 1. Check Joseki / Opening Book (95% high precision for opening moves)
    const totalStonesOnBoard = board.grid.flat().filter(c => c !== null).length;
    const isEarlyOpening = totalStonesOnBoard < 35;
    const effectiveOpeningRate = isEarlyOpening ? Math.max(openingRate, 0.95) : openingRate;

    if (Math.random() < effectiveOpeningRate) {
      const opening = JosekiBook.getOpeningMove(board.size, board.grid, aiColor);
      if (opening && board.grid[opening.point.y][opening.point.x] === null) {
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

    // 2. Evaluate ALL valid moves using full-strength Evaluator (모든 단계에서 동일)
    // 핵심: 초급이라도 "정확한 평가"를 하고, "의도적으로 약한 수를 선택"하는 구조
    const candidateScores: { point: Point; heuristicScore: number }[] = [];
    for (const pt of validMoves) {
      if (board.grid[pt.y][pt.x] !== null) continue;
      // 평가 시에는 항상 프로급 rankName을 사용하여 정확한 점수를 산출
      const score = Evaluator.evaluateMovePattern(board, pt.x, pt.y, aiColor, '프로 평가');
      if (score > -300) {
        candidateScores.push({ point: pt, heuristicScore: score });
      }
    }

    if (candidateScores.length === 0) {
      return { move: null, recommendations: [] };
    }

    candidateScores.sort((a, b) => b.heuristicScore - a.heuristicScore);
    // 상위 16개 후보를 항상 선별 (모든 단계 동일)
    const topCandidates = candidateScores.slice(0, Math.min(16, candidateScores.length));

    const enemyColor: StoneColor = aiColor === 'black' ? 'white' : 'black';
    const evaluatedCandidates: {
      point: Point;
      totalScore: number;
      explanation: string;
      category: '실리' | '세력' | '공격' | '방어' | '끝내기' | '정석';
    }[] = [];

    // 3. Minimax Lookahead (모든 단계에서 최소 1수 앞 읽기 수행)
    for (const cand of topCandidates) {
      const simBoard = new GoBoard(board.size, false);
      simBoard.grid = board.cloneGrid(board.grid);
      simBoard.turn = board.turn;
      simBoard.capturesBlack = board.capturesBlack;
      simBoard.capturesWhite = board.capturesWhite;
      simBoard.koPoint = board.koPoint ? { ...board.koPoint } : null;

      simBoard.playMove(cand.point.x, cand.point.y, aiColor);

      const staticBalance = Evaluator.evaluateBoardState(simBoard, aiColor);

      let worstCounterBalance = staticBalance;

      // 2수 이상 읽기: 상대 반격 시뮬레이션 (모든 단계에서 2수 이상 미리 읽도록 탐색 30% 강화)
      if (sims >= 1) {
        const enemyMoves = simBoard.getValidMovesFast(enemyColor);
        const enemyCandidates: { pt: Point; score: number }[] = [];
        for (const ePt of enemyMoves) {
          const eScore = Evaluator.evaluateMovePattern(simBoard, ePt.x, ePt.y, enemyColor, '프로 평가');
          if (eScore > -200) {
            enemyCandidates.push({ pt: ePt, score: eScore });
          }
        }
        enemyCandidates.sort((a, b) => b.score - a.score);
        const topEnemy = enemyCandidates.slice(0, Math.min(sims <= 3 ? 3 : 6, enemyCandidates.length));

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

    // 4. 초급 난이도 30% 수읽기 상향 (1위 최선수 98%+, 상대 반격 읽기 정교화)
    // ====================================================================
    // 종반 패스(PASS) 자동 계가 신청 판단:
    // 판 위 둘 자리가 무의미하거나 가치점수(totalScore < 30)가 낮으면
    // AI가 자기 집을 메우지 않고 스스로 PASS(패스)하여 자동 계가를 신청합니다!
    const totalStones = board.grid.flat().filter(c => c !== null).length;
    const bestCand = evaluatedCandidates[0];
    const isPassRecommended = (totalStones > 110 && bestCand && bestCand.totalScore < 30) ||
                              (board.historyIndex > 0 && board.history[board.historyIndex - 1]?.move === null && bestCand && bestCand.totalScore < 60);

    if (isPassRecommended) {
      return { move: null, recommendations: [] }; // AI PASS (계가 신청)
    }

    let chosenIndex = 0;
    const numCands = evaluatedCandidates.length;
    const rand = Math.random();

    if (sims <= 3) {
      // STAGE 1~3 (초급 30% 상향): 1위 최선수 (98%), 2위 차선수 (2%)
      chosenIndex = (numCands >= 2 && rand < 0.02) ? 1 : 0;
    } else {
      chosenIndex = 0;
    }

    const selectedCand = evaluatedCandidates[chosenIndex] || evaluatedCandidates[0];

    // Filter out recommendations to strictly empty cells only!
    const recommendations: AiRecommendation[] = evaluatedCandidates
      .filter(item => board.grid[item.point.y][item.point.x] === null)
      .slice(0, 3)
      .map((item, idx) => {
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

