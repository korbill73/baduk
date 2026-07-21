import type { StoneColor } from './go';

export interface UserProfile {
  id: string; // e.g. "baduk-user-1721562911"
  nickname: string; // e.g. "한게임9단"
  rankTitle: string; // e.g. "아마 3단"
  stats: {
    vsAiWins: number;
    vsAiLosses: number;
    onlineWins: number;
    onlineLosses: number;
    pvpWins: number;
    pvpLosses: number;
  };
  createdAt: number;
}

export interface GameRecordEntry {
  id: string;
  date: string;
  opponent: string; // "AI 프로 9단" or friend's nickname
  mode: 'play' | 'pvp' | 'online';
  playerColor: StoneColor;
  result: 'win' | 'loss' | 'draw';
  scoreDiff?: number;
}

export type PvpMessageType =
  | 'PROFILE_SYNC'
  | 'GAME_START'
  | 'MOVE'
  | 'UNDO_REQUEST'
  | 'UNDO_ACCEPT'
  | 'UNDO_REJECT'
  | 'PASS'
  | 'RESIGN'
  | 'SCORING_OPEN'
  | 'DEAD_STONE_TOGGLE'
  | 'CHAT_MESSAGE'
  | 'COLOR_SWAP';

export interface PvpMessage {
  type: PvpMessageType;
  senderId?: string;
  payload?: any;
}

export interface ProfileSyncPayload {
  profile: UserProfile;
  assignedColor: StoneColor;
  komi: number;
}

export interface MovePayload {
  x: number;
  y: number;
  color: StoneColor;
}

export interface ChatMessagePayload {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
