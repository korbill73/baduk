export type BoardSize = 9 | 13 | 19;

export type StoneColor = 'black' | 'white' | null;

export interface Point {
  x: number;
  y: number;
}

export interface Move {
  x: number;
  y: number;
  color: 'black' | 'white';
  isPass?: boolean;
  isResign?: boolean;
  comment?: string;
}

export interface GameHistoryItem {
  boardState: StoneColor[][];
  move: Move | null;
  capturesBlack: number;
  capturesWhite: number;
  koPoint: Point | null;
}

export type RankLevel = string;

export interface RankInfo {
  id: string;
  name: RankLevel;
  badgeColor: string;
  description: string;
  mctsSimulations: number;
  searchDepth: number;
  aiStyle: string;
  openingBookRate: number; // 0.0 ~ 1.0 (정석 활용 확률)
}

export interface TerritoryMap {
  blackTerritory: Point[];
  whiteTerritory: Point[];
  dame: Point[];
  blackScore: number;
  whiteScore: number;
  komi: number;
  estimatedWinRate: number; // 0 ~ 100 (Black win percentage)
}

export interface AiRecommendation {
  point: Point;
  rank: number; // 1, 2, 3
  winRateChange: number; // e.g., +2.4% or -0.5%
  explanation: string;
  category: '실리' | '세력' | '공격' | '방어' | '사활' | '끝내기' | '정석';
}

export interface TsumegoNode {
  point: Point;
  response?: Point;
  next?: TsumegoNode[];
  comment: string;
  isCorrect?: boolean;
}

export interface TsumegoPuzzle {
  id: string;
  title: string;
  level: RankLevel;
  category: '사활' | '맥점' | '포석' | '끝내기' | '묘수';
  description: string;
  boardSize: BoardSize;
  initialStones: { x: number; y: number; color: 'black' | 'white' }[];
  playerColor: 'black' | 'white';
  solutionTree: TsumegoNode[];
  failureComment: string;
  hint: string;
}

export type GameMode = 'play' | 'pvp' | 'online' | 'review' | 'tsumego';

export interface GameStatusData {
  mode: GameMode;
  boardSize: BoardSize;
  turn: 'black' | 'white';
  userColor: 'black' | 'white';
  aiColor: 'black' | 'white';
  aiRank: RankInfo;
  capturesBlack: number;
  capturesWhite: number;
  komi: number;
  isThinking: boolean;
  gameOver: boolean;
  resultMessage: string | null;
  history: GameHistoryItem[];
  historyIndex: number; // for review mode
  showTerritory: boolean;
  showHints: boolean;
  recommendations: AiRecommendation[];
  territoryMap: TerritoryMap | null;
  currentPuzzle: TsumegoPuzzle | null;
  puzzleSolved: 'correct' | 'wrong' | null;
  puzzleComment: string | null;
}
