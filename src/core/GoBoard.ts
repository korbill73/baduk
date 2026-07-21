import type { BoardSize, StoneColor, Point, Move, GameHistoryItem } from '../types/go';

export interface GroupInfo {
  stones: Point[];
  liberties: Point[];
  color: StoneColor;
}

export class GoBoard {
  size: BoardSize;
  grid: StoneColor[][];
  turn: 'black' | 'white';
  capturesBlack: number;
  capturesWhite: number;
  koPoint: Point | null;
  history: GameHistoryItem[];
  historyIndex: number;
  consecutivePasses: number;
  gameOver: boolean;
  resultMessage: string | null;
  recordHistory: boolean; // Set to false during MCTS simulations for 100x speedup

  constructor(size: BoardSize = 19, recordHistory: boolean = true) {
    this.size = size;
    this.grid = this.createEmptyGrid(size);
    this.turn = 'black';
    this.capturesBlack = 0;
    this.capturesWhite = 0;
    this.koPoint = null;
    this.history = [];
    this.historyIndex = -1;
    this.consecutivePasses = 0;
    this.gameOver = false;
    this.resultMessage = null;
    this.recordHistory = recordHistory;

    // Save initial state if recording
    if (this.recordHistory) {
      this.pushHistory(null);
    }
  }

  createEmptyGrid(size: BoardSize): StoneColor[][] {
    const grid: StoneColor[][] = [];
    for (let y = 0; y < size; y++) {
      const row: StoneColor[] = [];
      for (let x = 0; x < size; x++) {
        row.push(null);
      }
      grid.push(row);
    }
    return grid;
  }

  cloneGrid(grid: StoneColor[][]): StoneColor[][] {
    return grid.map(row => [...row]);
  }

  isValidPoint(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  getNeighbors(x: number, y: number): Point[] {
    const pts: Point[] = [];
    const dirs = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ];
    for (const d of dirs) {
      const nx = x + d.x;
      const ny = y + d.y;
      if (this.isValidPoint(nx, ny)) {
        pts.push({ x: nx, y: ny });
      }
    }
    return pts;
  }

  // Find all connected stones and all unique liberties
  getGroupInfo(x: number, y: number, grid: StoneColor[][] = this.grid): GroupInfo | null {
    const color = grid[y][x];
    if (!color) return null;

    const visitedStones: boolean[][] = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    const visitedLiberties: boolean[][] = Array.from({ length: this.size }, () => Array(this.size).fill(false));

    const stones: Point[] = [];
    const liberties: Point[] = [];
    const queue: Point[] = [{ x, y }];
    visitedStones[y][x] = true;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      stones.push(curr);

      for (const nb of this.getNeighbors(curr.x, curr.y)) {
        const nbColor = grid[nb.y][nb.x];
        if (nbColor === null) {
          if (!visitedLiberties[nb.y][nb.x]) {
            visitedLiberties[nb.y][nb.x] = true;
            liberties.push(nb);
          }
        } else if (nbColor === color && !visitedStones[nb.y][nb.x]) {
          visitedStones[nb.y][nb.x] = true;
          queue.push(nb);
        }
      }
    }

    return { stones, liberties, color };
  }

  // Fast zero-clone validity check (suicide & Ko) for MCTS rollouts and node expansion
  canPlayFast(x: number, y: number, color: 'black' | 'white' = this.turn): boolean {
    if (this.gameOver) return false;
    if (!this.isValidPoint(x, y)) return false;
    if (this.grid[y][x] !== null) return false;

    // Ko check
    if (this.koPoint && this.koPoint.x === x && this.koPoint.y === y && color === this.turn) {
      return false;
    }

    const neighbors = this.getNeighbors(x, y);
    const enemyColor: 'black' | 'white' = color === 'black' ? 'white' : 'black';

    // 1. If any neighbor is empty, placing here has immediately at least 1 liberty -> valid!
    for (const nb of neighbors) {
      if (this.grid[nb.y][nb.x] === null) {
        return true;
      }
    }

    // 2. If no empty neighbor, check if any adjacent enemy group has exactly 1 liberty (we capture it -> valid!)
    for (const nb of neighbors) {
      if (this.grid[nb.y][nb.x] === enemyColor) {
        const grp = this.getGroupInfo(nb.x, nb.y);
        if (grp && grp.liberties.length === 1) {
          return true; // Captures enemy stones!
        }
      }
    }

    // 3. If no empty neighbor and no enemy capture, check if any adjacent friendly group has > 1 liberty
    for (const nb of neighbors) {
      if (this.grid[nb.y][nb.x] === color) {
        const grp = this.getGroupInfo(nb.x, nb.y);
        if (grp && grp.liberties.length > 1) {
          return true; // Merges with friendly group that has liberties left!
        }
      }
    }

    // Otherwise, placing here captures nothing and leaves 0 liberties -> Suicide (`자충수`) -> invalid!
    return false;
  }

  canPlay(x: number, y: number, color: 'black' | 'white' = this.turn): { valid: boolean; reason?: string } {
    if (this.gameOver) return { valid: false, reason: '게임이 이미 종료되었습니다.' };
    if (!this.isValidPoint(x, y)) return { valid: false, reason: '판을 벗어난 위치입니다.' };
    if (this.grid[y][x] !== null) return { valid: false, reason: '이미 돌이 놓인 자리입니다.' };

    // Ko check
    if (this.koPoint && this.koPoint.x === x && this.koPoint.y === y && color === this.turn) {
      return { valid: false, reason: '패(Ko) 규칙: 바로 되따낼 수 없습니다. 다른 곳을 먼저 두어야 합니다.' };
    }

    if (!this.canPlayFast(x, y, color)) {
      return { valid: false, reason: '자충수(Suicide): 스스로 숨구멍을 막는 곳에는 둘 수 없습니다.' };
    }

    return { valid: true };
  }

  playMove(x: number, y: number, color: 'black' | 'white' = this.turn): boolean {
    if (!this.canPlayFast(x, y, color)) {
      return false;
    }

    // Truncate history if we are in past review index
    if (this.recordHistory && this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    const enemyColor: 'black' | 'white' = color === 'black' ? 'white' : 'black';
    this.grid[y][x] = color;

    // Execute capture
    let capturedCount = 0;
    const capturedPoints: Point[] = [];
    const neighbors = this.getNeighbors(x, y);

    for (const nb of neighbors) {
      if (this.grid[nb.y][nb.x] === enemyColor) {
        const group = this.getGroupInfo(nb.x, nb.y);
        if (group && group.liberties.length === 0) {
          capturedCount += group.stones.length;
          for (const st of group.stones) {
            capturedPoints.push(st);
            this.grid[st.y][st.x] = null;
          }
        }
      }
    }

    if (color === 'black') {
      this.capturesBlack += capturedCount;
    } else {
      this.capturesWhite += capturedCount;
    }

    // Determine new Ko point
    if (capturedCount === 1) {
      const ownGroup = this.getGroupInfo(x, y);
      if (ownGroup && ownGroup.stones.length === 1 && ownGroup.liberties.length === 1) {
        this.koPoint = { x: capturedPoints[0].x, y: capturedPoints[0].y };
      } else {
        this.koPoint = null;
      }
    } else {
      this.koPoint = null;
    }

    this.consecutivePasses = 0;
    const move: Move = { x, y, color };
    this.turn = enemyColor;
    
    if (this.recordHistory) {
      this.pushHistory(move);
    }
    return true;
  }

  passMove(color: 'black' | 'white' = this.turn): void {
    if (this.gameOver) return;

    if (this.recordHistory && this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.consecutivePasses += 1;
    this.koPoint = null;
    const move: Move = { x: -1, y: -1, color, isPass: true, comment: `${color === 'black' ? '흑' : '백'} 한수 쉼 (Pass)` };
    this.turn = color === 'black' ? 'white' : 'black';
    
    if (this.recordHistory) {
      this.pushHistory(move);
    }

    if (this.consecutivePasses >= 2) {
      this.gameOver = true;
      this.resultMessage = '양측 연속 통과(Pass)로 대국이 종료되었습니다. 계가를 진행합니다.';
    }
  }

  resign(color: 'black' | 'white' = this.turn): void {
    if (this.gameOver) return;
    this.gameOver = true;
    const winnerColor = color === 'black' ? '백' : '흑';
    this.resultMessage = `${color === 'black' ? '흑' : '백'} 불계패 (${winnerColor} 불계승!)`;
    const move: Move = { x: -1, y: -1, color, isResign: true, comment: `${color === 'black' ? '흑' : '백'} 기권 (Resign)` };
    if (this.recordHistory) {
      this.pushHistory(move);
    }
  }

  pushHistory(move: Move | null) {
    const item: GameHistoryItem = {
      boardState: this.cloneGrid(this.grid),
      move,
      capturesBlack: this.capturesBlack,
      capturesWhite: this.capturesWhite,
      koPoint: this.koPoint ? { ...this.koPoint } : null
    };
    this.history.push(item);
    this.historyIndex = this.history.length - 1;
  }

  undoMove(): boolean {
    if (this.historyIndex <= 0) return false;
    this.historyIndex -= 1;
    this.restoreHistoryState(this.historyIndex);
    this.gameOver = false;
    this.resultMessage = null;
    return true;
  }

  redoMove(): boolean {
    if (this.historyIndex >= this.history.length - 1) return false;
    this.historyIndex += 1;
    this.restoreHistoryState(this.historyIndex);
    return true;
  }

  jumpToHistory(index: number): boolean {
    if (index < 0 || index >= this.history.length) return false;
    this.historyIndex = index;
    this.restoreHistoryState(this.historyIndex);
    return true;
  }

  restoreHistoryState(index: number) {
    const item = this.history[index];
    this.grid = this.cloneGrid(item.boardState);
    this.capturesBlack = item.capturesBlack;
    this.capturesWhite = item.capturesWhite;
    this.koPoint = item.koPoint ? { ...item.koPoint } : null;

    if (item.move) {
      this.turn = item.move.color === 'black' ? 'white' : 'black';
    } else {
      this.turn = 'black';
    }
  }

  // Fast valid moves generation without board cloning
  getValidMovesFast(color: 'black' | 'white' = this.turn): Point[] {
    const moves: Point[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.canPlayFast(x, y, color)) {
          if (!this.isTrueEye(x, y, color)) {
            moves.push({ x, y });
          }
        }
      }
    }
    return moves;
  }

  // Get all valid moves for current turn (used by AI)
  getValidMoves(color: 'black' | 'white' = this.turn): Point[] {
    return this.getValidMovesFast(color);
  }

  // Simple eye detection to prevent AI from filling its own 1-point eye
  isTrueEye(x: number, y: number, color: 'black' | 'white'): boolean {
    if (this.grid[y][x] !== null) return false;
    
    // Check all 4 neighbors are our color (or board edge)
    for (const nb of this.getNeighbors(x, y)) {
      if (this.grid[nb.y][nb.x] !== color) return false;
    }

    // Check diagonals (at most 1 diagonal can be enemy or empty for interior eye, 0 for edge eye)
    const diags = [
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 }
    ];

    let enemyOrEmptyDiags = 0;
    let isEdgeOrCorner = false;
    for (const d of diags) {
      if (!this.isValidPoint(d.x, d.y)) {
        isEdgeOrCorner = true;
      } else if (this.grid[d.y][d.x] !== color) {
        enemyOrEmptyDiags++;
      }
    }

    if (isEdgeOrCorner && enemyOrEmptyDiags >= 1) return false;
    if (!isEdgeOrCorner && enemyOrEmptyDiags >= 2) return false;

    return true;
  }
}
