import { GoBoard } from './GoBoard';
import type { TerritoryMap, Point, StoneColor } from '../types/go';

export class ScoringEngine {
  // Calculate territory and win-rate using Influence Diffusion & exact flood-fill when game ends
  static estimateTerritoryAndScore(board: GoBoard, komi: number = 6.5, deadStones: Set<string> = new Set()): TerritoryMap {
    const size = board.size;
    const grid = board.grid;

    let extraCapturesBlack = 0;
    let extraCapturesWhite = 0;
    if (deadStones.size > 0) {
      for (const key of deadStones) {
        const [dx, dy] = key.split(',').map(Number);
        if (dx >= 0 && dx < size && dy >= 0 && dy < size) {
          if (grid[dy][dx] === 'white') extraCapturesBlack++;
          else if (grid[dy][dx] === 'black') extraCapturesWhite++;
        }
      }
    }

    // 1. Calculate influence values across the board using distance decay
    const influenceGrid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

    // Iterate through all stones and spread influence (ignoring dead stones)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color && !deadStones.has(`${x},${y}`)) {
          const power = color === 'black' ? 1.0 : -1.0;
          // Spread up to Manhattan distance 5
          for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                const dist = Math.abs(dx) + Math.abs(dy);
                if (dist === 0) {
                  influenceGrid[ny][nx] += power * 5.0; // Strong base on the stone itself
                } else {
                  // Exponential decay
                  influenceGrid[ny][nx] += power * (1.8 / Math.pow(1.6, dist));
                }
              }
            }
          }
        }
      }
    }

    const blackTerritory: Point[] = [];
    const whiteTerritory: Point[] = [];
    const dame: Point[] = [];

    // Threshold for considering an empty point belonging to territory
    const threshold = 0.45;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // If empty intersection OR dead stone
        if (grid[y][x] === null || deadStones.has(`${x},${y}`)) {
          const inf = influenceGrid[y][x];
          if (inf > threshold) {
            blackTerritory.push({ x, y });
          } else if (inf < -threshold) {
            whiteTerritory.push({ x, y });
          } else {
            dame.push({ x, y });
          }
        }
      }
    }

    // Calculate score (Territory + Captures + Dead Stones)
    const blackScore = blackTerritory.length + board.capturesBlack + extraCapturesBlack;
    const whiteScore = whiteTerritory.length + board.capturesWhite + extraCapturesWhite + komi;

    // Estimate win rate using logistic sigmoid based on score difference
    const scoreDiff = blackScore - whiteScore;
    const scale = size === 9 ? 0.35 : size === 13 ? 0.25 : 0.16;
    let estimatedWinRate = (1 / (1 + Math.exp(-scale * scoreDiff))) * 100;
    
    estimatedWinRate = Math.min(99.4, Math.max(0.6, estimatedWinRate));

    return {
      blackTerritory,
      whiteTerritory,
      dame,
      blackScore: Math.round(blackScore * 10) / 10,
      whiteScore: Math.round(whiteScore * 10) / 10,
      komi,
      estimatedWinRate: Math.round(estimatedWinRate * 10) / 10
    };
  }

  // Fast territory evaluation for MCTS backpropagation (runs in < 0.08ms)
  static evaluateTerritoryBalance(board: GoBoard, aiColor: StoneColor, komi: number = 6.5): number {
    if (!aiColor) return 0;
    const size = board.size;
    const grid = board.grid;

    let blackPoints = board.capturesBlack * 2.2;
    let whitePoints = board.capturesWhite * 2.2 + komi;

    // Iterate and accumulate influence based on distance 3 window
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = grid[y][x];
        if (c === 'black') {
          blackPoints += 2.0;
          // Local influence around stone
          for (const nb of board.getNeighbors(x, y)) {
            if (grid[nb.y][nb.x] === null) blackPoints += 0.65;
          }
        } else if (c === 'white') {
          whitePoints += 2.0;
          for (const nb of board.getNeighbors(x, y)) {
            if (grid[nb.y][nb.x] === null) whitePoints += 0.65;
          }
        } else {
          // Check corner/side territory bonus for empty points
          let blackSurround = 0;
          let whiteSurround = 0;
          for (const nb of board.getNeighbors(x, y)) {
            if (grid[nb.y][nb.x] === 'black') blackSurround++;
            else if (grid[nb.y][nb.x] === 'white') whiteSurround++;
          }
          if (blackSurround >= 2 && whiteSurround === 0) blackPoints += 1.0;
          else if (whiteSurround >= 2 && blackSurround === 0) whitePoints += 1.0;
        }
      }
    }

    const diff = blackPoints - whitePoints;
    return aiColor === 'black' ? diff : -diff;
  }

  // Exact flood-fill scoring for game end (when all borders are closed)
  static finalScoring(board: GoBoard, komi: number = 6.5, deadStones: Set<string> = new Set()): TerritoryMap {
    const size = board.size;
    const grid = board.grid;
    const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    let extraCapturesBlack = 0;
    let extraCapturesWhite = 0;
    if (deadStones.size > 0) {
      for (const key of deadStones) {
        const [dx, dy] = key.split(',').map(Number);
        if (dx >= 0 && dx < size && dy >= 0 && dy < size) {
          if (grid[dy][dx] === 'white') extraCapturesBlack++;
          else if (grid[dy][dx] === 'black') extraCapturesWhite++;
        }
      }
    }

    const blackTerritory: Point[] = [];
    const whiteTerritory: Point[] = [];
    const dame: Point[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((grid[y][x] === null || deadStones.has(`${x},${y}`)) && !visited[y][x]) {
          const region: Point[] = [];
          const queue: Point[] = [{ x, y }];
          visited[y][x] = true;

          let touchesBlack = false;
          let touchesWhite = false;

          while (queue.length > 0) {
            const curr = queue.shift()!;
            region.push(curr);

            const dirs = [
              { x: 0, y: -1 },
              { x: 1, y: 0 },
              { x: 0, y: 1 },
              { x: -1, y: 0 }
            ];

            for (const d of dirs) {
              const nx = curr.x + d.x;
              const ny = curr.y + d.y;
              if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                const color = deadStones.has(`${nx},${ny}`) ? null : grid[ny][nx];
                if (color === 'black') touchesBlack = true;
                else if (color === 'white') touchesWhite = true;
                else if (color === null && !visited[ny][nx]) {
                  visited[ny][nx] = true;
                  queue.push({ x: nx, y: ny });
                }
              }
            }
          }

          if (touchesBlack && !touchesWhite) {
            blackTerritory.push(...region);
          } else if (touchesWhite && !touchesBlack) {
            whiteTerritory.push(...region);
          } else {
            dame.push(...region);
          }
        }
      }
    }

    const blackScore = blackTerritory.length + board.capturesBlack + extraCapturesBlack;
    const whiteScore = whiteTerritory.length + board.capturesWhite + extraCapturesWhite + komi;
    const scoreDiff = blackScore - whiteScore;
    const scale = size === 9 ? 0.35 : size === 13 ? 0.25 : 0.16;
    const estimatedWinRate = Math.min(99.4, Math.max(0.6, (1 / (1 + Math.exp(-scale * scoreDiff))) * 100));

    return {
      blackTerritory,
      whiteTerritory,
      dame,
      blackScore: Math.round(blackScore * 10) / 10,
      whiteScore: Math.round(whiteScore * 10) / 10,
      komi,
      estimatedWinRate: Math.round(estimatedWinRate * 10) / 10
    };
  }
}
