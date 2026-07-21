import { GoBoard } from '../core/GoBoard';
import type { StoneColor } from '../types/go';

export class ShapePatternMatcher {
  /**
   * Evaluate the shape quality of placing `color` at (x, y).
   * Returns a score bonus (>0 for good pro shapes, <0 for bad shapes / blunders).
   */
  static evaluateShape(board: GoBoard, x: number, y: number, color: StoneColor, moveNumber: number): number {
    let score = 0;
    const size = board.size;
    const grid = board.grid;
    const enemyColor: StoneColor = color === 'black' ? 'white' : 'black';

    // 1. PENALIZE 1st and 2nd line crawling during opening & early midgame (< 80 moves) unless capturing
    const isEdge1st = (x === 0 || x === size - 1 || y === 0 || y === size - 1);
    const isEdge2nd = (x === 1 || x === size - 2 || y === 1 || y === size - 2);
    if (moveNumber < 80) {
      if (isEdge1st) {
        // 1선은 패망선 (자살/끝내기 외 초중반 절대 금지)
        score -= 450.0;
      } else if (isEdge2nd && moveNumber < 40) {
        // 2선은 패배선 (초반 40수 이전 2선 기어다니기 강력 억제)
        score -= 220.0;
      }
    }

    // 2. CHECK EMPTY TRIANGLE (빈삼각 우형 금지)
    // An empty triangle is 3 friendly stones in a 2x2 square with the 4th corner empty
    const dirs2x2 = [
      [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }],
      [{ dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 }],
      [{ dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }],
      [{ dx: -1, dy: 0 }, { dx: 0, dy: -1 }, { dx: -1, dy: -1 }]
    ];
    for (const sq of dirs2x2) {
      const p1 = { x: x + sq[0].dx, y: y + sq[0].dy };
      const p2 = { x: x + sq[1].dx, y: y + sq[1].dy };
      const p3 = { x: x + sq[2].dx, y: y + sq[2].dy };
      if (board.isValidPoint(p1.x, p1.y) && board.isValidPoint(p2.x, p2.y) && board.isValidPoint(p3.x, p3.y)) {
        if (grid[p1.y][p1.x] === color && grid[p2.y][p2.x] === color && grid[p3.y][p3.x] === null) {
          // Empty triangle detected! Penalize clunky shape
          score -= 380.0;
        }
      }
    }

    // 3. REWARD GOOD PRO SHAPES (유단자 고품격 행마)
    const nbs = board.getNeighbors(x, y);
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    for (const nb of nbs) {
      if (grid[nb.y][nb.x] === color) friendlyNeighbors++;
      else if (grid[nb.y][nb.x] === enemyColor) enemyNeighbors++;
    }

    // A. Tiger's Mouth (호구 연결 및 방어 형세)
    if (friendlyNeighbors === 2 && enemyNeighbors === 0) {
      score += 90.0;
    }

    // B. One-Space Jump (한칸 뜀: 1칸 떨어진 곳에 아군이 있고 사이가 비어있는 중앙 행마)
    const jumps1 = [{ dx: 2, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 2 }, { dx: 0, dy: -2 }];
    for (const j of jumps1) {
      const jx = x + j.dx;
      const jy = y + j.dy;
      const midx = x + j.dx / 2;
      const midy = y + j.dy / 2;
      if (board.isValidPoint(jx, jy) && grid[jy][jx] === color && grid[midy][midx] === null) {
        // Excellent light jump towards center or side
        score += 140.0;
        if (y >= 4 && y <= size - 5 && x >= 4 && x <= size - 5) {
          score += 60.0; // Bonus for center extension
        }
      }
    }

    // C. Knight's Move (날일자 행마: 대각선 1+2칸)
    const knights = [
      { dx: 1, dy: 2 }, { dx: -1, dy: 2 }, { dx: 1, dy: -2 }, { dx: -1, dy: -2 },
      { dx: 2, dy: 1 }, { dx: -2, dy: 1 }, { dx: 2, dy: -1 }, { dx: -2, dy: -1 }
    ];
    for (const k of knights) {
      const kx = x + k.dx;
      const ky = y + k.dy;
      if (board.isValidPoint(kx, ky) && grid[ky][kx] === color) {
        score += 130.0; // Flexible, dynamic Knight's shape
      } else if (board.isValidPoint(kx, ky) && grid[ky][kx] === enemyColor) {
        // Knight's approach/cap on enemy stone (씌우기/걸침)
        score += 110.0;
      }
    }

    // D. Bamboo Joint (쌍립: 끊어지지 않는 절대 단단한 연결)
    const diagonals = [{ dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }];
    for (const d of diagonals) {
      const dxPoint = { x: x + d.dx, y: y + d.dy };
      if (board.isValidPoint(dxPoint.x, dxPoint.y) && grid[dxPoint.y][dxPoint.x] === color) {
        const side1 = { x: x + d.dx, y: y };
        const side2 = { x: x, y: y + d.dy };
        if (grid[side1.y][side1.x] === color || grid[side2.y][side2.x] === color) {
          score += 150.0; // Solid shape
        }
      }
    }

    // 4. STRATEGIC OPEN SPACE BONUS (대세점: 주변 4x4 영역이 비어있는 넓은 변/중앙 선점)
    let openSpaceCount = 0;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const sx = x + dx;
        const sy = y + dy;
        if (board.isValidPoint(sx, sy) && grid[sy][sx] === null) {
          openSpaceCount++;
        }
      }
    }
    if (moveNumber >= 20 && moveNumber <= 110 && openSpaceCount >= 30) {
      score += 180.0; // Big strategic influence (`대세점 선점`)
    }

    return score;
  }
}
