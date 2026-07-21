import { GoBoard } from '../core/GoBoard';
import type { StoneColor, Point } from '../types/go';

export class DeadGroupFilter {
  /**
   * Check if placing `color` at (x, y) is placing inside or adjacent to a dead group
   * trapped inside an inescapable enemy cage without any chance of escape or making two eyes (`보태주기/사석 보태기`).
   */
  static isDeadInCage(board: GoBoard, x: number, y: number, color: StoneColor): boolean {
    if (!color) return true;
    const size = board.size;
    const grid = board.grid;
    const enemyColor: StoneColor = color === 'black' ? 'white' : 'black';

    // 1. Simulate the move first
    const sim = new GoBoard(size, false);
    sim.grid = board.cloneGrid(board.grid);
    sim.playMove(x, y, color);
    const grp = sim.getGroupInfo(x, y);
    if (!grp) return true;

    // If simulating this move instantly captures enemy stones, it's a fight/capture, NOT a dead move!
    for (const nb of board.getNeighbors(x, y)) {
      if (grid[nb.y][nb.x] === enemyColor) {
        const eGrp = board.getGroupInfo(nb.x, nb.y);
        if (eGrp && eGrp.liberties.length === 1) {
          return false; // Capturing enemy stones!
        }
      }
    }

    // 2. Exact BFS Flood-Fill from our liberties to see if we can reach wide open board space or escape routes
    const visited = new Set<string>();
    const queue: Point[] = [...grp.liberties];
    for (const lib of grp.liberties) {
      visited.add(`${lib.x},${lib.y}`);
    }

    let reachableEmptyPoints = 0;
    let adjacentEnemyStones = 0;
    let adjacentFriendlyStones = grp.stones.length;

    while (queue.length > 0 && reachableEmptyPoints < 18) {
      const curr = queue.shift()!;
      reachableEmptyPoints++;

      for (const nb of board.getNeighbors(curr.x, curr.y)) {
        const key = `${nb.x},${nb.y}`;
        const c = grid[nb.y][nb.x];
        if (c === null && !visited.has(key)) {
          visited.add(key);
          queue.push(nb);
        } else if (c === enemyColor) {
          adjacentEnemyStones++;
        } else if (c === color) {
          adjacentFriendlyStones++;
        }
      }
    }

    // If BFS reaches 18+ connected empty intersections, our group has wide open space to live or run
    if (reachableEmptyPoints >= 18) {
      return false;
    }

    // 3. If reachable empty space is small (< 18), check if enemy stones completely dominate the enclosure
    // Check local 5x5 window around (x, y)
    let localEnemy = 0;
    let localFriendly = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (board.isValidPoint(nx, ny)) {
          const c = grid[ny][nx];
          if (c === enemyColor) localEnemy++;
          else if (c === color) localFriendly++;
        }
      }
    }

    // If we are placing inside an enemy cage where local enemy stones >= 6 and we have no wide escape (< 18 space)
    // AND we cannot capture any surrounding enemy stone (all adjacent enemy groups have >= 3 liberties)
    if (localEnemy >= 6 && localEnemy > localFriendly * 1.5 && reachableEmptyPoints < 12) {
      let canBreakThrough = false;
      for (const st of grp.stones) {
        for (const nb of board.getNeighbors(st.x, st.y)) {
          if (grid[nb.y][nb.x] === enemyColor) {
            const eGrp = board.getGroupInfo(nb.x, nb.y);
            if (eGrp && eGrp.liberties.length <= 2) {
              canBreakThrough = true;
              break;
            }
          }
        }
        if (canBreakThrough) break;
      }

      if (!canBreakThrough) {
        // Absolutely dead inside an enemy cage! Placing here is feeding dead stones (`사석 보태기/죽은 곳 착수`)
        return true;
      }
    }

    // If our resulting group liberties <= 2 and localEnemy > localFriendly and can't capture, dead!
    if (grp.liberties.length <= 2 && localEnemy >= 4 && capturesCount(board, x, y, enemyColor) === 0) {
      return true;
    }

    return false;
  }
}

function capturesCount(board: GoBoard, x: number, y: number, enemyColor: StoneColor): number {
  let count = 0;
  for (const nb of board.getNeighbors(x, y)) {
    if (board.grid[nb.y][nb.x] === enemyColor) {
      const eGrp = board.getGroupInfo(nb.x, nb.y);
      if (eGrp && eGrp.liberties.length === 1) count += eGrp.stones.length;
    }
  }
  return count;
}
