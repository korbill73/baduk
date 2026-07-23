import React from 'react';
import type { RankInfo } from '../../types/go';
import { RANKS_DATA } from '../../data/tsumegoPuzzles';
import { X, CheckCircle2, Lock, Trophy, Flame, Swords, Crown, Shield, Gem } from 'lucide-react';
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
  // Color palette by stage tier for rich RPG game aesthetic
  const getStageTheme = (idx: number) => {
    if (idx <= 2) {
      // Emerald / Jade Green (Entry Level)
      return {
        accent: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.45))',
        border: 'rgba(16, 185, 129, 0.5)',
        glow: 'rgba(16, 185, 129, 0.4)',
        icon: <Shield size={16} color="#34d399" />,
        tierName: '입문/초급 바이옴'
      };
    } else if (idx <= 5) {
      // Cyan / Sapphire Blue (Intermediate)
      return {
        accent: '#38bdf8',
        gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(3, 105, 161, 0.45))',
        border: 'rgba(56, 189, 248, 0.5)',
        glow: 'rgba(56, 189, 248, 0.4)',
        icon: <Gem size={16} color="#38bdf8" />,
        tierName: '중급 전술 바이옴'
      };
    } else if (idx <= 8) {
      // Purple / Amethyst (Advanced)
      return {
        accent: '#c084fc',
        gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.25), rgba(126, 34, 206, 0.45))',
        border: 'rgba(192, 132, 252, 0.5)',
        glow: 'rgba(192, 132, 252, 0.4)',
        icon: <Swords size={16} color="#c084fc" />,
        tierName: '상급 수읽기 바이옴'
      };
    } else if (idx <= 11) {
      // Royal Amber / Gold (Master / Dan)
      return {
        accent: '#fbbf24',
        gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(180, 83, 9, 0.5))',
        border: 'rgba(251, 191, 36, 0.65)',
        glow: 'rgba(251, 191, 36, 0.5)',
        icon: <Crown size={16} color="#fbbf24" />,
        tierName: '유단자 마스터 바이옴'
      };
    } else {
      // Crimson / Ruby Flame (Godlike 300)
      return {
        accent: '#f43f5e',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.35), rgba(159, 18, 57, 0.6))',
        border: 'rgba(244, 63, 94, 0.8)',
        glow: 'rgba(244, 63, 94, 0.6)',
        icon: <Flame size={16} color="#f43f5e" />,
        tierName: 'AI 신계 천상 영역'
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
      backgroundColor: 'rgba(2, 6, 20, 0.92)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '0.8rem'
    }}>
      <div className="glass-panel" style={{
        width: '96vw',
        maxWidth: '1150px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.2rem 1.4rem',
        position: 'relative',
        border: '2px solid #fbbf24',
        boxShadow: '0 0 60px rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #b45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.6)'
            }}>
              <Trophy size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px', background: 'linear-gradient(90deg, #f8fafc, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎮 AI 수읽기 승단 챌린지 RPG 스테이지 맵
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                현 단계를 1승하면 다음 수읽기 레벨이 해금되며, 3패를 기록하면 아래 단계로 강등됩니다!
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
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(56, 189, 248, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 'var(--radius-md)',
          padding: '0.55rem 0.95rem',
          marginBottom: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Flame size={22} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', lineHeight: 1.35, color: '#f1f5f9' }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.86rem', marginRight: '8px' }}>
              ⚔️ 승단 / 강등 규칙:
            </strong>
            <span>
              • <strong>승급 규칙</strong>: 최고 해금 단계에서 <strong>1승만 거두면 다음 단계 언락!</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              • <strong>강등 규칙</strong>: 누적 <strong>3패 달성 시 1단계 아래로 강등</strong> (현재 누적: <strong style={{ color: '#ef4444' }}>{currentRankLosses}패</strong> / 3패 시 강등)
            </span>
          </div>
        </div>

        {/* Ranks Quest Map Grid (Wide 4 Columns without Scroll) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '0.7rem',
          overflowY: 'auto',
          maxHeight: '72vh',
          padding: '4px'
        }}>
          {RANKS_DATA.map((rank, idx) => {
            const isSelected = rank.id === currentRank.id;
            const isUnlocked = idx <= maxUnlockedRankIndex;
            const isCleared = idx < maxUnlockedRankIndex;
            const isCurrentChallenge = idx === maxUnlockedRankIndex;
            const theme = getStageTheme(idx);

            return (
              <div
                key={rank.id}
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
                  background: isSelected
                    ? `linear-gradient(135deg, ${theme.accent}33, rgba(15, 23, 42, 0.95))`
                    : isUnlocked
                      ? theme.gradient
                      : 'rgba(15, 23, 42, 0.55)',
                  border: isSelected
                    ? `2.5px solid ${theme.accent}`
                    : isCurrentChallenge
                      ? '2.5px solid #fbbf24'
                      : isCleared
                        ? `1.8px solid ${theme.border}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 0.85rem',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  boxShadow: isSelected
                    ? `0 0 25px ${theme.glow}`
                    : isCurrentChallenge
                      ? '0 0 20px rgba(245, 158, 11, 0.45)'
                      : 'none',
                  opacity: isUnlocked ? 1 : 0.45
                }}
              >
                {/* Stage Header Line & Status Badges INSIDE card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {theme.icon}
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: theme.accent, letterSpacing: '0.5px' }}>
                      STAGE {idx + 1}
                    </span>
                  </div>

                  {/* Badges fully contained inside card to prevent top clipping */}
                  <div>
                    {isCurrentChallenge && (
                      <span style={{
                        background: '#fbbf24', color: '#0f172a', fontSize: '0.65rem', fontWeight: 900,
                        padding: '2px 7px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(245,158,11,0.5)',
                        display: 'inline-flex', alignItems: 'center', gap: '3px'
                      }}>
                        ⭐ 도전 중
                      </span>
                    )}
                    {isCleared && !isCurrentChallenge && (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                        padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px'
                      }}>
                        <CheckCircle2 size={11} /> 완료
                      </span>
                    )}
                    {!isUnlocked && (
                      <span style={{
                        background: 'rgba(71, 85, 105, 0.8)', color: '#cbd5e1', fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px'
                      }}>
                        <Lock size={11} /> 잠김
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage Title */}
                <div style={{ fontSize: '0.94rem', fontWeight: 900, color: isUnlocked ? '#f8fafc' : '#94a3b8', margin: '1px 0' }}>
                  {rank.name}
                </div>

                {/* Description */}
                <div style={{ fontSize: '0.72rem', color: isUnlocked ? '#cbd5e1' : '#64748b', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rank.description}
                </div>

                {/* Search Depth & Visits Info Bar */}
                <div style={{
                  fontSize: '0.7rem', fontWeight: 800, color: isUnlocked ? theme.accent : '#64748b',
                  background: isUnlocked ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)',
                  padding: '3px 6px', borderRadius: '6px', textAlign: 'center',
                  border: `1px solid ${isUnlocked ? theme.border : 'transparent'}`
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
