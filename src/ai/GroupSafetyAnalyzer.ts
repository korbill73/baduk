import { GoBoard } from '../core/GoBoard';
import type { Point, StoneColor } from '../types/go';
import { DeadGroupFilter } from './DeadGroupFilter';

export class GroupSafetyAnalyzer {
  /**
   * Evaluate if placing `aiColor` at (x, y) helps save a weak/dying friendly group (liberties <= 3)
   * OR attacks a weak enemy group (liberties <= 3).
   * Returns a major score bonus for critical group safety moves.
   */
  static evaluateGroupSafetyBonus(board: GoBoard, x: number, y: number, aiColor: StoneColor): number {
    if (!aiColor) return 0;
    if (DeadGroupFilter.isDeadInCage(board, x, y, aiColor)) {
      return -3500.0; // 사석/죽은 돌 안에 보태주기 절대 금지!
    }
    let bonus = 0;
    const size = board.size;
    const grid = board.grid;
    const enemyColor: StoneColor = aiColor === 'black' ? 'white' : 'black';

    // Check adjacent and diagonal neighbors (`within 2 spaces`)
    const nearbyPoints: Point[] = [];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (board.isValidPoint(nx, ny) && (dx !== 0 || dy !== 0)) {
          nearbyPoints.push({ x: nx, y: ny });
        }
      }
    }

    const checkedFriendlyGroups = new Set<string>();
    const checkedEnemyGroups = new Set<string>();

    for (const pt of nearbyPoints) {
      const c = grid[pt.y][pt.x];
      if (c === aiColor) {
        const grp = board.getGroupInfo(pt.x, pt.y);
        if (grp) {
          const key = `${grp.stones[0].x},${grp.stones[0].y}`;
          if (!checkedFriendlyGroups.has(key)) {
            checkedFriendlyGroups.add(key);
            // If our friendly group has 3 liberties and size >= 4, it is in danger of being surrounded (`미생 위기`)!
            if (grp.liberties.length === 3 && grp.stones.length >= 4) {
              // Check if playing at (x, y) increases this group's liberties or connects to a stronger group
              const sim = new GoBoard(size, false);
              sim.grid = board.cloneGrid(board.grid);
              sim.playMove(x, y, aiColor || 'black');
              const newGrp = sim.getGroupInfo(pt.x, pt.y);
              if (newGrp && newGrp.liberties.length >= 4) {
                bonus += 2200.0 + grp.stones.length * 150.0; // Huge safety boost to prevent 58-stone captures
              }
            } else if (grp.liberties.length === 2 && grp.stones.length >= 2) {
              const sim = new GoBoard(size, false);
              sim.grid = board.cloneGrid(board.grid);
              sim.playMove(x, y, aiColor || 'black');
              const newGrp = sim.getGroupInfo(pt.x, pt.y);
              if (newGrp && newGrp.liberties.length >= 3) {
                bonus += 3800.0 + grp.stones.length * 250.0;
              }
            }
          }
        }
      } else if (c === enemyColor) {
        const grp = board.getGroupInfo(pt.x, pt.y);
        if (grp) {
          const key = `${grp.stones[0].x},${grp.stones[0].y}`;
          if (!checkedEnemyGroups.has(key)) {
            checkedEnemyGroups.add(key);
            // If enemy group has 3 liberties, playing at (x, y) to cap/surround it is a high-value attack (`대마 압박`)
            if (grp.liberties.length === 3 && grp.stones.length >= 4) {
              const sim = new GoBoard(size, false);
              sim.grid = board.cloneGrid(board.grid);
              sim.playMove(x, y, aiColor || 'black');
              const reducedGrp = sim.getGroupInfo(grp.stones[0].x, grp.stones[0].y);
              if (reducedGrp && reducedGrp.liberties.length === 2) {
                bonus += 2100.0 + grp.stones.length * 140.0;
              }
            }
          }
        }
      }
    }

    // Eye-Space Check: If (x, y) completes a solid eye (`완생 눈`) or prevents opponent from destroying eye space inside our territory
    const nbs = board.getNeighbors(x, y);
    const diags = [
      { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }
    ];
    let friendlyNbs = 0;
    for (const nb of nbs) {
      if (grid[nb.y][nb.x] === aiColor) friendlyNbs++;
    }
    if (friendlyNbs === nbs.length) {
      // Surrounded by all our stones on orthogonal sides -> Check if diagonals are clean -> EYE MAKING
      let cleanDiags = 0;
      for (const d of diags) {
        const dxPoint = { x: x + d.dx, y: y + d.dy };
        if (!board.isValidPoint(dxPoint.x, dxPoint.y) || grid[dxPoint.y][dxPoint.x] !== enemyColor) {
          cleanDiags++;
        }
      }
      if (cleanDiags >= diags.length - 1) {
        // This point is a vital eye point! If our group has weak liberties or midgame, preserving/making eyes is essential
        bonus += 350.0;
      }
    }

    return bonus;
  }
}
