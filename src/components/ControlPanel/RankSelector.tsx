import React from 'react';
import type { RankInfo } from '../../types/go';
import { RANKS_DATA } from '../../data/tsumegoPuzzles';
import { X, CheckCircle2, Lock, Trophy, Flame, Swords, Crown, Shield, Gem, Zap } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface RankSelectorProps {
  currentRank: RankInfo;
  maxUnlockedRankIndex?: number;
  currentRankLosses?: number;
  onSelectRank: (rank: RankInfo, index: number) => void;
  onClose: () => void;
}

export const RankSelector: React.FC<RankSelectorProps> = ({
  currentRank,
  maxUnlockedRankIndex = 0,
  currentRankLosses = 0,
  onSelectRank,
  onClose,
}) => {
  console.log('Active rank:', currentRank.name);

  // Rich vibrant theme & colorful emoji icons based on reference design
  const getStageTheme = (idx: number, isCurrent: boolean, isUnlocked: boolean) => {
    if (isCurrent) {
      return {
        accent: '#fbbf24',
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(30, 58, 110, 0.95))',
        border: '#fbbf24',
        glow: '0 0 30px rgba(245, 158, 11, 0.75)',
        textColor: '#ffffff',
        subTextColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        emoji: '⭐',
        icon: <Zap size={16} color="#fbbf24" className="animate-pulse" />
      };
    }

    if (idx <= 2) {
      // 🌿 Leaf / Emerald (Entry Level: 5, 10, 15 sims)
      return {
        accent: '#34d399',
        bg: isUnlocked ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(20, 48, 80, 0.92))' : 'rgba(25, 42, 68, 0.88)',
        border: isUnlocked ? '#10b981' : 'rgba(16, 185, 129, 0.4)',
        glow: 'none',
        textColor: '#f8fafc',
        subTextColor: '#a7f3d0',
        badgeBg: '#10b981',
        emoji: '🌿',
        icon: <Shield size={14} color="#34d399" />
      };
    } else if (idx <= 5) {
      // 💎 Sapphire Diamond (Beginner: 20, 25, 40 sims)
      return {
        accent: '#38bdf8',
        bg: isUnlocked ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(15, 48, 85, 0.92))' : 'rgba(25, 48, 78, 0.88)',
        border: isUnlocked ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)',
        glow: 'none',
        textColor: '#f8fafc',
        subTextColor: '#bae6fd',
        badgeBg: '#0284c7',
        emoji: '💎',
        icon: <Gem size={14} color="#38bdf8" />
      };
    } else if (idx <= 8) {
      // 🔮 Amethyst Orb (Intermediate: 70, 110, 160 sims)
      return {
        accent: '#c084fc',
        bg: isUnlocked ? 'linear-gradient(135deg, rgba(192, 132, 252, 0.25), rgba(35, 32, 80, 0.92))' : 'rgba(35, 35, 75, 0.88)',
        border: isUnlocked ? '#c084fc' : 'rgba(192, 132, 252, 0.4)',
        glow: 'none',
        textColor: '#f8fafc',
        subTextColor: '#e9d5ff',
        badgeBg: '#9333ea',
        emoji: '🔮',
        icon: <Swords size={14} color="#c084fc" />
      };
    } else if (idx <= 11) {
      // 👑 Crown Gold (Master / Dan: 230, 350, 500 sims)
      return {
        accent: '#f43f5e',
        bg: isUnlocked ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(50, 25, 65, 0.92))' : 'rgba(45, 25, 60, 0.88)',
        border: isUnlocked ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)',
        glow: 'none',
        textColor: '#f8fafc',
        subTextColor: '#fecdd3',
        badgeBg: '#e11d48',
        emoji: '👑',
        icon: <Crown size={14} color="#f43f5e" />
      };
    } else {
      // 🔥 Crimson Flame (Godlike: 800 sims)
      return {
        accent: '#fb923c',
        bg: isUnlocked ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(65, 30, 45, 0.92))' : 'rgba(50, 30, 48, 0.88)',
        border: isUnlocked ? '#fb923c' : 'rgba(251, 146, 60, 0.4)',
        glow: 'none',
        textColor: '#f8fafc',
        subTextColor: '#fed7aa',
        badgeBg: '#ea580c',
        emoji: '🔥',
        icon: <Flame size={14} color="#fb923c" />
      };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(6, 14, 30, 0.94)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '0.5rem'
    }}>
      <div className="glass-panel rank-selector-modal" style={{
        width: '92vw',
        maxWidth: '1100px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.1rem 1.3rem',
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(15, 28, 54, 0.98), rgba(10, 20, 40, 0.99))',
        border: '2px solid #fbbf24',
        boxShadow: '0 0 60px rgba(245, 158, 11, 0.4)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.7)',
              flexShrink: 0
            }}>
              <Trophy size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.3px', background: 'linear-gradient(90deg, #ffffff, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎮 AI 수읽기 승단 챌린지 RPG 스테이지 맵
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '1px 0 0 0', fontWeight: 600 }}>
                현재 최고 해금 단계에서 1승 시 다음 수읽기 레벨이 즉시 언락되며, 3패 기록 시 아래 단계로 강등됩니다!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Challenge Rule Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(56, 189, 248, 0.22))',
          border: '1.5px solid #fbbf24',
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.9rem',
          marginBottom: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 15px rgba(245,158,11,0.2)'
        }}>
          <Flame size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', lineHeight: 1.35, color: '#ffffff' }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.84rem', marginRight: '6px', fontWeight: 900 }}>
              ⚔️ 승단 / 강등 규칙:
            </strong>
            <span>
              • <strong>승급 규칙</strong>: 최고 해금 단계에서 <strong>1승만 거두면 다음 단계 즉시 언락!</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              • <strong>강등 규칙</strong>: 도전 중 <strong>3패 달성 시 1단계 아래 강등</strong> (현재 누적: <strong style={{ color: '#ef4444', background: 'rgba(239,68,68,0.2)', padding: '1px 6px', borderRadius: '4px' }}>{currentRankLosses}패</strong> / 3패 시 강등)
            </span>
          </div>
        </div>

        {/* Ranks Quest Map Grid - Responsive 4 Columns (PC) / 1 Column Full Details (Mobile) */}
        <div className="rank-map-grid" style={{
          display: 'grid',
          gap: '0.65rem',
          padding: '8px 12px',
          boxSizing: 'border-box',
          flex: 1
        }}>
          {RANKS_DATA.map((rank, idx) => {
            const isUnlocked = idx <= maxUnlockedRankIndex;
            const isCleared = idx < maxUnlockedRankIndex;
            const isCurrentChallenge = idx === maxUnlockedRankIndex;
            const theme = getStageTheme(idx, isCurrentChallenge, isUnlocked);

            return (
              <div
                key={rank.id}
                className="rank-stage-card"
                onClick={() => {
                  if (!isUnlocked) {
                    soundManager.playError();
                    alert(`🔒 [단계 잠김]\n\n이전 단계(${RANKS_DATA[idx - 1]?.name})를 최소 1승 하셔야 이 단계가 해금됩니다!`);
                    return;
                  }
                  soundManager.playStoneClick();
                  onSelectRank(rank, idx);
                  onClose();
                }}
                style={{
                  background: theme.bg,
                  border: isCurrentChallenge ? '3px solid #fbbf24' : `1.8px solid ${theme.border}`,
                  outline: isCurrentChallenge ? '2px solid rgba(251, 191, 36, 0.8)' : 'none',
                  outlineOffset: '1px',
                  borderRadius: 'var(--radius-md)',
                  padding: isCurrentChallenge ? '0.6rem 0.85rem' : '0.55rem 0.8rem',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.35rem',
                  boxShadow: theme.glow,
                  transform: 'none',
                  zIndex: isCurrentChallenge ? 10 : 1,
                  boxSizing: 'border-box'
                }}
              >
                {/* Header Line with Colorful Emoji */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{theme.emoji}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, color: theme.accent, letterSpacing: '0.4px' }}>
                      STAGE {idx + 1}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isCurrentChallenge && (
                      <span style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#ffffff',
                        fontSize: '0.66rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.6)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ⭐ 현재 도전 중!
                      </span>
                    )}
                    {isCleared && !isCurrentChallenge && (
                      <span style={{
                        background: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle2 size={11} /> 완료
                      </span>
                    )}
                    {!isUnlocked && (
                      <span style={{
                        background: 'rgba(51, 65, 85, 0.9)',
                        color: '#94a3b8',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Lock size={11} /> 잠김
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage Title */}
                <div style={{
                  fontSize: isCurrentChallenge ? '1rem' : '0.92rem',
                  fontWeight: 900,
                  color: isCurrentChallenge ? '#fbbf24' : '#ffffff',
                  margin: '0'
                }}>
                  {rank.name}
                </div>

                {/* Full Unclipped Description */}
                <div className="rank-stage-desc" style={{
                  fontSize: '0.78rem',
                  color: isCurrentChallenge ? '#fef08a' : (isUnlocked ? '#e2e8f0' : '#cbd5e1'),
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  {rank.description}
                </div>

                {/* Search Depth & Visits Bar */}
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isCurrentChallenge ? '#ffffff' : theme.accent,
                  background: isCurrentChallenge ? 'rgba(245, 158, 11, 0.4)' : 'rgba(15, 23, 42, 0.75)',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  border: `1px solid ${isCurrentChallenge ? '#fbbf24' : theme.border}`,
                  marginTop: '2px'
                }}>
                  탐색 깊이: {rank.searchDepth}수 ({rank.mctsSimulations}회 연산)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
