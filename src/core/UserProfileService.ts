import type { UserProfile, GameRecordEntry } from '../types/pvp';
import type { StoneColor } from '../types/go';

const PROFILE_KEY = 'baduk_user_profile_v1';
const HISTORY_KEY = 'baduk_game_history_v1';

export class UserProfileService {
  static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load user profile:', e);
    }

    // Default Profile
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const initialProfile: UserProfile = {
      id: `baduk-user-${Date.now().toString().slice(-6)}`,
      nickname: `바둑기사#${randomId}`,
      rankTitle: '아마 1단',
      stats: {
        vsAiWins: 0,
        vsAiLosses: 0,
        onlineWins: 0,
        onlineLosses: 0,
        pvpWins: 0,
        pvpLosses: 0,
      },
      createdAt: Date.now(),
    };
    this.saveProfile(initialProfile);
    return initialProfile;
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  }

  static updateNickname(newNickname: string, newRankTitle?: string): UserProfile {
    const profile = this.getProfile();
    profile.nickname = newNickname.trim() || profile.nickname;
    if (newRankTitle) profile.rankTitle = newRankTitle;
    this.saveProfile(profile);
    return profile;
  }

  static recordGameResult(
    mode: 'play' | 'pvp' | 'online',
    result: 'win' | 'loss' | 'draw',
    opponent: string,
    playerColor: StoneColor,
    scoreDiff?: number
  ): { profile: UserProfile; history: GameRecordEntry[]; isRankUp?: boolean; newUnlockedIndex?: number } {
    const profile = this.getProfile();

    if (result === 'win') {
      if (mode === 'play') profile.stats.vsAiWins++;
      else if (mode === 'online') profile.stats.onlineWins++;
      else profile.stats.pvpWins++;
    } else if (result === 'loss') {
      if (mode === 'play') profile.stats.vsAiLosses++;
      else if (mode === 'online') profile.stats.onlineLosses++;
      else profile.stats.pvpLosses++;
    }

    let isRankUp = false;
    let newUnlockedIndex = profile.maxUnlockedRankIndex ?? 0;

    // 승급 & 강등 처리 (AI 대국 모드일 때)
    if (mode === 'play') {
      const currentRankIndex = profile.currentRankIndex ?? 0;
      const maxUnlockedRankIndex = profile.maxUnlockedRankIndex ?? 0;
      let currentRankLosses = profile.currentRankLosses ?? 0;

      if (result === 'win') {
        currentRankLosses = 0; // 승리 시 패 카운트 리셋
        // 현재 최고 해금 단계에서 1승을 거두면 다음 단계 언락 및 승급! (최대 13 인덱스 = STAGE 14)
        if (currentRankIndex >= maxUnlockedRankIndex && maxUnlockedRankIndex < 13) {
          profile.maxUnlockedRankIndex = maxUnlockedRankIndex + 1;
          profile.currentRankIndex = maxUnlockedRankIndex + 1;
          isRankUp = true;
          newUnlockedIndex = maxUnlockedRankIndex + 1;
        }
      } else if (result === 'loss') {
        currentRankLosses++;
        if (currentRankLosses >= 3) {
          // 3패 달성 시 1단계 아래로 강등
          currentRankLosses = 0;
          if (currentRankIndex > 0) {
            profile.currentRankIndex = currentRankIndex - 1;
          }
        }
      }
      profile.currentRankLosses = currentRankLosses;
    }

    this.saveProfile(profile);

    // Save history entry
    const entry: GameRecordEntry = {
      id: `rec-${Date.now()}`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      opponent,
      mode,
      playerColor,
      result,
      scoreDiff,
    };

    const history = this.getHistory();
    history.unshift(entry);
    // Keep max 50 recent games
    if (history.length > 50) history.pop();

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save game history:', e);
    }

    return { profile, history, isRankUp, newUnlockedIndex };
  }

  static getHistory(): GameRecordEntry[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load game history:', e);
    }
    return [];
  }
}
