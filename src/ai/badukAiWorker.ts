import { GoBoard } from '../core/GoBoard';
import { MCTSEngine } from '../ai/MCTS';
import type { StoneColor, RankInfo, BoardSize, Point } from '../types/go';

interface AiWorkerRequest {
  type: 'CALCULATE_MOVE' | 'GET_HINTS';
  size: BoardSize;
  grid: StoneColor[][];
  turn: 'black' | 'white';
  capturesBlack: number;
  capturesWhite: number;
  koPoint: Point | null;
  rankInfo: RankInfo;
}

self.onmessage = (e: MessageEvent<AiWorkerRequest>) => {
  const { type, size, grid, turn, capturesBlack, capturesWhite, koPoint, rankInfo } = e.data;

  // Reconstruct GoBoard state in the worker
  const board = new GoBoard(size);
  board.grid = board.cloneGrid(grid);
  board.turn = turn;
  board.capturesBlack = capturesBlack;
  board.capturesWhite = capturesWhite;
  board.koPoint = koPoint ? { ...koPoint } : null;

  try {
    const result = MCTSEngine.runSearch(board, turn, rankInfo);
    if (type === 'CALCULATE_MOVE') {
      self.postMessage({
        type: 'MOVE_RESULT',
        move: result.move,
        recommendations: result.recommendations
      });
    } else if (type === 'GET_HINTS') {
      self.postMessage({
        type: 'HINTS_RESULT',
        recommendations: result.recommendations
      });
    }
  } catch (err: any) {
    self.postMessage({
      type: 'ERROR',
      error: err.message || 'AI 수읽기 중 오류 발생'
    });
  }
};
