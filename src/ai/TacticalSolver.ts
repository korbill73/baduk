import { GoBoard } from '../core/GoBoard';
import type { Point, StoneColor } from '../types/go';
import { DeadGroupFilter } from './DeadGroupFilter';

export interface TacticalUrgentMove {
  point: Point;
  priorityScore: number;
  reason: string;
  type: 'SAVE_ATARI' | 'CAPTURE_ENEMY' | 'EXTEND_LIBERTIES' | 'ATTACK_2_LIBERTIES';
}

export class TacticalSolver {
  // Scan entire board instantly for emergency Ataris (1 liberty) and urgent fights (2 liberties)
  static findUrgentTacticalMoves(board: GoBoard, aiColor: StoneColor): TacticalUrgentMove[] {
    if (!aiColor || board.gameOver) return [];
    const size = board.size;
    const grid = board.grid;
    const enemyColor: StoneColor = aiColor === 'black' ? 'white' : 'black';
    const urgentMoves: TacticalUrgentMove[] = [];

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

            // 1. If our group is in ATARI (1 liberty)
            if (c === aiColor && grp.liberties.length === 1) {
              const escapePoint = grp.liberties[0];
              const sim = new GoBoard(size, false);
              sim.grid = board.cloneGrid(board.grid);
              sim.turn = board.turn;
              sim.capturesBlack = board.capturesBlack;
              sim.capturesWhite = board.capturesWhite;
              sim.koPoint = board.koPoint ? { ...board.koPoint } : null;

              if (sim.canPlayFast(escapePoint.x, escapePoint.y, aiColor)) {
                // Check if trying to escape simply feeds a dead stone into a cage (`보태주기 차단`)
                if (!DeadGroupFilter.isDeadInCage(board, escapePoint.x, escapePoint.y, aiColor)) {
                  sim.playMove(escapePoint.x, escapePoint.y, aiColor);
                  const newGrp = sim.getGroupInfo(escapePoint.x, escapePoint.y);
                  if (newGrp && newGrp.liberties.length >= 2) {
                    urgentMoves.push({
                      point: escapePoint,
                      priorityScore: 10000 + grp.stones.length * 500,
                      reason: `🚨 [단수 긴급 탈출] 숨구멍이 1개인 아군 돌(${grp.stones.length}개)을 구출합니다!`,
                      type: 'SAVE_ATARI'
                    });
                  }
                } else {
                  // If escaping is futile because it's in a dead cage, check if we can CAPTURE an adjacent enemy group to survive!
                  for (const st of grp.stones) {
                    const nbs = board.getNeighbors(st.x, st.y);
                    for (const nb of nbs) {
                      if (grid[nb.y][nb.x] === enemyColor) {
                        const enemyGrp = board.getGroupInfo(nb.x, nb.y);
                        if (enemyGrp && enemyGrp.liberties.length === 1) {
                          const capPt = enemyGrp.liberties[0];
                          if (board.canPlayFast(capPt.x, capPt.y, aiColor)) {
                            urgentMoves.push({
                              point: capPt,
                              priorityScore: 12000 + grp.stones.length * 600 + enemyGrp.stones.length * 400,
                              reason: `💥 [반격 따내기로 탈출] 적 돌(${enemyGrp.stones.length}개)을 따내어 위기에 빠진 아군 대마를 구출합니다!`,
                              type: 'SAVE_ATARI'
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            // 2. If enemy group is in ATARI (1 liberty) -> CAPTURE IMMEDIATELY (`따내기`)
            if (c === enemyColor && grp.liberties.length === 1) {
              const capPoint = grp.liberties[0];
              if (board.canPlayFast(capPoint.x, capPoint.y, aiColor)) {
                urgentMoves.push({
                  point: capPoint,
                  priorityScore: 9500 + grp.stones.length * 450,
                  reason: `🎯 [적 대마 단수 포획] 숨구멍이 1개 남은 적 돌(${grp.stones.length}개)을 확실하게 따냅니다!`,
                  type: 'CAPTURE_ENEMY'
                });
              }
            }

            // 3. If our group (size >= 3) has 2 liberties -> Urgent defense / extend ONLY IF NOT DEAD CAGE
            if (c === aiColor && grp.liberties.length === 2 && grp.stones.length >= 3) {
              for (const lib of grp.liberties) {
                if (board.canPlayFast(lib.x, lib.y, aiColor) && !DeadGroupFilter.isDeadInCage(board, lib.x, lib.y, aiColor)) {
                  const sim = new GoBoard(size, false);
                  sim.grid = board.cloneGrid(board.grid);
                  sim.playMove(lib.x, lib.y, aiColor);
                  const extGrp = sim.getGroupInfo(lib.x, lib.y);
                  if (extGrp && extGrp.liberties.length >= 3) {
                    urgentMoves.push({
                      point: lib,
                      priorityScore: 3500 + grp.stones.length * 150,
                      reason: `🛡️ [사활 보강] 2수 남은 아군 요석(${grp.stones.length}개)의 호흡구를 3수 이상으로 늘려 방어합니다.`,
                      type: 'EXTEND_LIBERTIES'
                    });
                  }
                }
              }
            }

            // 4. If enemy group (size >= 3) has 2 liberties -> Attack / Atarize (`아타리 압박`)
            if (c === enemyColor && grp.liberties.length === 2 && grp.stones.length >= 3) {
              for (const lib of grp.liberties) {
                if (board.canPlayFast(lib.x, lib.y, aiColor)) {
                  const sim = new GoBoard(size, false);
                  sim.grid = board.cloneGrid(board.grid);
                  sim.playMove(lib.x, lib.y, aiColor);
                  const reducedGrp = sim.getGroupInfo(grp.stones[0].x, grp.stones[0].y);
                  if (reducedGrp && reducedGrp.liberties.length === 1) {
                    urgentMoves.push({
                      point: lib,
                      priorityScore: 3200 + grp.stones.length * 140,
                      reason: `⚔️ [대마 공격/단수 몰기] 숨구멍이 2개인 적 대마(${grp.stones.length}개)를 단수로 몰아 압박합니다!`,
                      type: 'ATTACK_2_LIBERTIES'
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Sort by urgent priority score descending
    urgentMoves.sort((a, b) => b.priorityScore - a.priorityScore);
    return urgentMoves;
  }
}
