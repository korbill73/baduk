import { GoBoard } from '../core/GoBoard';
import type { StoneColor, RankLevel } from '../types/go';
import { ScoringEngine } from '../core/Scoring';
import { ShapePatternMatcher } from './ShapePatternMatcher';
import { GroupSafetyAnalyzer } from './GroupSafetyAnalyzer';
import { DeadGroupFilter } from './DeadGroupFilter';

export class Evaluator {
  // Evaluate the static quality of a move before or during MCTS
  static evaluateMovePattern(board: GoBoard, x: number, y: number, color: StoneColor, rankName: RankLevel): number {
    if (!color) return -1000;
    const size = board.size;
    const grid = board.grid;
    const enemyColor = color === 'black' ? 'white' : 'black';

    // 0. Simulate move first to check absolute basic validity & prevent suicide/self-atari blunders
    const neighbors = board.getNeighbors(x, y);
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    let emptyNeighbors = 0;

    for (const nb of neighbors) {
      const c = grid[nb.y][nb.x];
      if (c === color) friendlyNeighbors++;
      else if (c === enemyColor) enemyNeighbors++;
      else emptyNeighbors++;
    }

    // Fast check for immediate captures
    let capturesCount = 0;
    for (const nb of neighbors) {
      if (grid[nb.y][nb.x] === enemyColor) {
        const grp = board.getGroupInfo(nb.x, nb.y);
        if (grp && grp.liberties.length === 1) {
          capturesCount += grp.stones.length;
        }
      }
    }

    // Simulate placing on temp board to check resulting group liberties
    const tempBoard = new GoBoard(board.size, false);
    tempBoard.grid = board.cloneGrid(board.grid);
    tempBoard.playMove(x, y, color);
    const newGroup = tempBoard.getGroupInfo(x, y);
    if (!newGroup) return -1000;

    const resultingLiberties = newGroup.liberties.length;

    // CRITICAL BASIC RULE 1: Self-Atari prohibition (스스로 단수가 되는 자충수 절대 금지)
    if (resultingLiberties === 1 && capturesCount === 0) {
      return -1000.0;
    }

    // CRITICAL BASIC RULE 2: Eye-filling prohibition (자신의 집 메우기 및 눈 메우기 절대 금지!)
    if (friendlyNeighbors >= 3 && enemyNeighbors === 0 && capturesCount === 0) {
      return -50000.0;
    }

    // CRITICAL BASIC RULE 2.5: Dead Cage / prisoner feeding prohibition (`사석/죽은 돌 보태주기 절대 금지`)
    if (capturesCount === 0 && DeadGroupFilter.isDeadInCage(board, x, y, color)) {
      return -50000.0;
    }

    // CRITICAL BASIC RULE 3: Cramped 2-liberty self-reduction during early/mid game
    let totalStones = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) totalStones++;
      }
    }
    const isOpening = totalStones < 30;
    const isMidgame = totalStones >= 30 && totalStones < 160;

    if (resultingLiberties === 2 && capturesCount === 0 && isOpening && emptyNeighbors === 0) {
      return -120.0;
    }

    let score = 0;

    // Capturing enemy stones is huge!
    if (capturesCount > 0) {
      score += capturesCount * 35.0 + 50.0;
    }

    // [NEW Pro Master Injection 1] Pro-level Shape Pattern Matching (Knight's move, one-space jump, bamboo joint, empty triangle block)
    score += ShapePatternMatcher.evaluateShape(board, x, y, color, board.historyIndex);

    // [NEW Pro Master Injection 2] Vital Group Safety & Eye-Space assessment (Save weak groups liberties <= 3, surround weak enemy groups)
    score += GroupSafetyAnalyzer.evaluateGroupSafetyBonus(board, x, y, color);

    // 1. Opening Strategy (포석: 귀 -> 변 -> 중앙 기본 원칙)
    if (isOpening) {
      if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
        score -= 40.0; // 1선 패망선 절대 금지
      } else if (x === 1 || x === size - 2 || y === 1 || y === size - 2) {
        score -= 18.0; // 2선 초반 금지
      } else if (x === 2 || x === size - 3 || y === 2 || y === size - 3) {
        score += 15.0; // 3선 (실리선)
        if ((x === 2 || x === 3 || x === size - 4 || x === size - 3) && (y === 2 || y === 3 || y === size - 4 || y === size - 3)) {
          score += 22.0; // 화점 / 소목 급소
        }
      } else if (x === 3 || x === size - 4 || y === 3 || y === size - 4) {
        score += 16.0; // 4선 (세력선)
        if ((x === 3 || x === size - 4) && (y === 3 || y === size - 4)) {
          score += 25.0; // 화점 Star point
        }
      } else {
        score -= 2.0;
      }
    } else {
      // Mid-game and Endgame lines (중종반: 1선/2선 끝내기 권리 & 경계선 점유 강력 우대)
      if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
        // 1선 끝내기: 상대 돌 근처 젖혀잇기
        if (enemyNeighbors > 0) score += 180.0;
        else score += 5.0;
      } else if (x === 1 || x === size - 2 || y === 1 || y === size - 2) {
        // 2선 끝내기: 알맹이 집 굳히기 & 젖혀잇기
        if (enemyNeighbors > 0) score += 240.0;
        else score += 40.0;
      } else if (x === 2 || x === size - 3 || y === 2 || y === size - 3) {
        score += 35.0;
      } else if (x === 3 || x === size - 4 || y === 3 || y === size - 4) {
        score += 30.0;
      } else {
        score += 15.0;
      }
    }

    // 2. Tactical Life/Death & Atari check for neighbors
    for (const nb of neighbors) {
      const c = grid[nb.y][nb.x];
      if (c === color) {
        const grp = board.getGroupInfo(nb.x, nb.y);
        if (grp && grp.liberties.length === 1 && resultingLiberties >= 2) {
          score += grp.stones.length * 50.0 + 120.0; // 단수 단단히 연결
        }
      } else if (c === enemyColor) {
        const grp = board.getGroupInfo(nb.x, nb.y);
        if (grp && grp.liberties.length === 2) {
          score += grp.stones.length * 18.0 + 60.0; // 상대 조이기 압박
        }
      }
    }

    // 3. Shape & Connection checks (끊음과 호구 연결)
    const diags = [
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 }
    ];

    let enemyDiags = 0;
    let friendlyDiags = 0;
    for (const d of diags) {
      if (board.isValidPoint(d.x, d.y)) {
        if (grid[d.y][d.x] === enemyColor) enemyDiags++;
        else if (grid[d.y][d.x] === color) friendlyDiags++;
      }
    }

    if (enemyNeighbors === 0 && enemyDiags >= 2) {
      // Cutting enemy stones (`끊음의 급소`)
      score += isMidgame ? 32.0 : 24.0;
    }
    if (friendlyNeighbors === 1 && friendlyDiags >= 1 && emptyNeighbors >= 2) {
      // Tiger's mouth / diagonal connection (`호구 연결/안형`)
      score += isMidgame ? 22.0 : 18.0;
    }
    if (friendlyNeighbors >= 2 && emptyNeighbors === 0 && rankName.includes('단')) {
      // Bad shape: Empty Triangle (`빈삼각`)
      score -= 15.0;
    }

    // Breathing room reward
    if (resultingLiberties >= 4) {
      score += 8.0;
    }

    // Minimal noise for tie-breaking only (동점 방지용 미세 노이즈)
    score += (Math.random() - 0.5) * 0.5;

    return score;
  }

  // Evaluate final position balance for MCTS backpropagation
  static evaluateBoardState(board: GoBoard, aiColor: StoneColor): number {
    if (!aiColor) return 0;
    const enemyColor = aiColor === 'black' ? 'white' : 'black';

    const territoryDiff = ScoringEngine.evaluateTerritoryBalance(board, aiColor, 6.5);

    const size = board.size;
    const grid = board.grid;
    let aiLiberties = 0;
    let enemyLiberties = 0;
    let aiAtariPenalty = 0;
    let enemyAtariBonus = 0;

    const checkedStones: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = grid[y][x];
        if (c && !checkedStones[y][x]) {
          const grp = board.getGroupInfo(x, y);
          if (grp) {
            for (const st of grp.stones) {
              checkedStones[st.y][st.x] = true;
            }
            if (c === aiColor) {
              aiLiberties += grp.liberties.length;
              if (grp.liberties.length === 1) {
                aiAtariPenalty += grp.stones.length * 25.0;
              } else if (grp.liberties.length === 2 && grp.stones.length >= 3) {
                aiAtariPenalty += grp.stones.length * 8.0;
              }
            } else if (c === enemyColor) {
              enemyLiberties += grp.liberties.length;
              if (grp.liberties.length === 1) {
                enemyAtariBonus += grp.stones.length * 25.0;
              } else if (grp.liberties.length === 2 && grp.stones.length >= 3) {
                enemyAtariBonus += grp.stones.length * 8.0;
              }
            }
          }
        }
      }
    }

    const libertyDiff = aiLiberties - enemyLiberties;
    const captureDiff = (aiColor === 'black' ? board.capturesBlack - board.capturesWhite : board.capturesWhite - board.capturesBlack);

    return (territoryDiff * 4.5) + (captureDiff * 16.0) + (libertyDiff * 0.8) + enemyAtariBonus - aiAtariPenalty;
  }
}
