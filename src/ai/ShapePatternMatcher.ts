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
    const isOpening = moveNumber < 60;

    // 1. PENALIZE 1st and 2nd line crawling during opening & early midgame (< 80 moves)
    const isEdge1st = (x === 0 || x === size - 1 || y === 0 || y === size - 1);
    const isEdge2nd = (x === 1 || x === size - 2 || y === 1 || y === size - 2);
    if (moveNumber < 80) {
      if (isEdge1st) {
        score -= 450.0;
      } else if (isEdge2nd && moveNumber < 40) {
        score -= 220.0;
      }
    }

    // 2. CHECK EMPTY TRIANGLE (빈삼각 우형 금지)
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
          score -= 380.0;
        }
      }
    }

    // 3. CLUSTERING PREVENTION — 포석에서 아군 돌 근처 뭉침 감점
    if (isOpening) {
      let nearbyFriendlyCount = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (board.isValidPoint(nx, ny) && grid[ny][nx] === color) {
            nearbyFriendlyCount++;
          }
        }
      }
      if (nearbyFriendlyCount >= 3) {
        score -= nearbyFriendlyCount * 80.0;
      } else if (nearbyFriendlyCount >= 2) {
        score -= 60.0;
      }
    }

    // 4. PRO SHAPE BONUSES (포석: 0.15배, 중반 이후: 1.0배)
    const nbs = board.getNeighbors(x, y);
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    for (const nb of nbs) {
      if (grid[nb.y][nb.x] === color) friendlyNeighbors++;
      else if (grid[nb.y][nb.x] === enemyColor) enemyNeighbors++;
    }

    const shapeScale = isOpening ? 0.15 : 1.0;

    // A. Tiger's Mouth (호구)
    if (friendlyNeighbors === 2 && enemyNeighbors === 0) {
      score += 90.0 * shapeScale;
    }

    // B. One-Space Jump (한칸 뜀)
    const jumps1 = [{ dx: 2, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 2 }, { dx: 0, dy: -2 }];
    for (const j of jumps1) {
      const jx = x + j.dx;
      const jy = y + j.dy;
      const midx = x + j.dx / 2;
      const midy = y + j.dy / 2;
      if (board.isValidPoint(jx, jy) && grid[jy][jx] === color && grid[midy][midx] === null) {
        score += 140.0 * shapeScale;
        if (y >= 4 && y <= size - 5 && x >= 4 && x <= size - 5) {
          score += 60.0 * shapeScale;
        }
      }
    }

    // C. Knight's Move (날일자)
    const knights = [
      { dx: 1, dy: 2 }, { dx: -1, dy: 2 }, { dx: 1, dy: -2 }, { dx: -1, dy: -2 },
      { dx: 2, dy: 1 }, { dx: -2, dy: 1 }, { dx: 2, dy: -1 }, { dx: -2, dy: -1 }
    ];
    for (const k of knights) {
      const kx = x + k.dx;
      const ky = y + k.dy;
      if (board.isValidPoint(kx, ky) && grid[ky][kx] === color) {
        score += 130.0 * shapeScale;
      } else if (board.isValidPoint(kx, ky) && grid[ky][kx] === enemyColor) {
        score += 110.0 * (isOpening ? 0.4 : 1.0);
      }
    }

    // D. Bamboo Joint (쌍립)
    const diagonals = [{ dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }];
    for (const d of diagonals) {
      const dxPoint = { x: x + d.dx, y: y + d.dy };
      if (board.isValidPoint(dxPoint.x, dxPoint.y) && grid[dxPoint.y][dxPoint.x] === color) {
        const side1 = { x: x + d.dx, y: y };
        const side2 = { x: x, y: y + d.dy };
        if (grid[side1.y][side1.x] === color || grid[side2.y][side2.x] === color) {
          score += 150.0 * shapeScale;
        }
      }
    }

    // 5. STRATEGIC TERRITORY SPREAD (포석 단계: 넓은 영역 확보 보너스)
    if (isOpening) {
      let wideOpenCount = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const sx = x + dx;
          const sy = y + dy;
          if (board.isValidPoint(sx, sy) && grid[sy][sx] === null) {
            wideOpenCount++;
          }
        }
      }
      if (wideOpenCount >= 40) {
        score += 250.0;
      } else if (wideOpenCount >= 30) {
        score += 180.0;
      } else if (wideOpenCount >= 20) {
        score += 80.0;
      }

      // 기존 아군 돌과의 최소 맨해튼 거리가 클수록 보너스 (분산 유도)
      let minFriendlyDist = Infinity;
      for (let gy = 0; gy < size; gy++) {
        for (let gx = 0; gx < size; gx++) {
          if (grid[gy][gx] === color) {
            const dist = Math.abs(gx - x) + Math.abs(gy - y);
            if (dist < minFriendlyDist) minFriendlyDist = dist;
          }
        }
      }
      if (minFriendlyDist >= 7) {
        score += 200.0;
      } else if (minFriendlyDist >= 5) {
        score += 120.0;
      } else if (minFriendlyDist >= 3) {
        score += 40.0;
      }
    } else {
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
      if (openSpaceCount >= 30) {
        score += 120.0;
      }
    }

    return score;
  }
}
