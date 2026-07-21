import { GoBoard } from '../core/GoBoard';
import type { StoneColor } from '../types/go';

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
    sim.playMove(x, y, color || 'black');
    const grp = sim.getGroupInfo(x, y);
    if (!grp) return true;

    // If simulating this move instantly captures enemy stones, it's NOT a dead cage move (`반격/따내기/사활 승부`)!
    for (const nb of board.getNeighbors(x, y)) {
      if (grid[nb.y][nb.x] === enemyColor) {
        const eGrp = board.getGroupInfo(nb.x, nb.y);
        if (eGrp && eGrp.liberties.length === 1) {
          return false; // Capturing enemy stones!
        }
      }
    }

    // 2. If the group has >= 5 liberties after placing, it has breath and room to run (`탈출/전투 가능`)
    if (grp.liberties.length >= 5) {
      return false;
    }

    // 3. Scan the surrounding area (radius 4 around our group) for open space or escape routes
    let openSpaceCount = 0;
    let enemySurroundingCount = 0;
    let friendlySurroundingCount = 0;

    for (const st of grp.stones) {
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const nx = st.x + dx;
          const ny = st.y + dy;
          if (board.isValidPoint(nx, ny)) {
            const c = grid[ny][nx];
            if (c === null) {
              openSpaceCount++;
            } else if (c === enemyColor) {
              enemySurroundingCount++;
            } else if (c === color) {
              friendlySurroundingCount++;
            }
          }
        }
      }
    }

    // 4. Check if we can make two distinct eyes inside (`안형 2개 여부`)
    // If liberties <= 3 and the ratio of surrounding enemy stones to open space is overwhelming (> 3:1)
    // AND there is virtually no open territory nearby (openSpaceCount < 14 around all stones combined),
    // then this group is entirely sealed inside an enemy cage (`완전 포위 사석`)!
    if (grp.liberties.length <= 3 && openSpaceCount < 14 && enemySurroundingCount > friendlySurroundingCount * 1.5) {
      // Check if any adjacent enemy stone has <= 2 liberties that we could break through
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
        // This group is dead in a cage! Placing here simply adds dead prisoners (`보태주기 떡수`)
        return true;
      }
    }

    return false;
  }
}
