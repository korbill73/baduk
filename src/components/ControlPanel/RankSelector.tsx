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
      return {
        accent: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.4))',
        border: 'rgba(16, 185, 129, 0.5)',
        glow: 'rgba(16, 185, 129, 0.35)',
        icon: <Shield size={14} color="#34d399" />
      };
    } else if (idx <= 5) {
      return {
        accent: '#38bdf8',
        gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(3, 105, 161, 0.4))',
        border: 'rgba(56, 189, 248, 0.5)',
        glow: 'rgba(56, 189, 248, 0.35)',
        icon: <Gem size={14} color="#38bdf8" />
      };
    } else if (idx <= 8) {
      return {
        accent: '#c084fc',
        gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.2), rgba(126, 34, 206, 0.4))',
        border: 'rgba(192, 132, 252, 0.5)',
        glow: 'rgba(192, 132, 252, 0.35)',
        icon: <Swords size={14} color="#c084fc" />
      };
    } else if (idx <= 11) {
      return {
        accent: '#fbbf24',
        gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(180, 83, 9, 0.45))',
        border: 'rgba(251, 191, 36, 0.6)',
        glow: 'rgba(251, 191, 36, 0.45)',
        icon: <Crown size={14} color="#fbbf24" />
      };
    } else {
      return {
        accent: '#f43f5e',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(159, 18, 57, 0.55))',
        border: 'rgba(244, 63, 94, 0.75)',
        glow: 'rgba(244, 63, 94, 0.5)',
        icon: <Flame size={14} color="#f43f5e" />
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
      padding: '0.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '98vw',
        maxWidth: '1240px',
        maxHeight: '96vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 1.2rem',
        position: 'relative',
        border: '2px solid #fbbf24',
        boxShadow: '0 0 60px rgba(245, 158, 11, 0.35)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden' // Force zero scrollbar
      }}>
        {/* Header Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #b45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.6)'
            }}>
              <Trophy size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px', background: 'linear-gradient(90deg, #f8fafc, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎮 AI 수읽기 승단 챌린지 RPG 스테이지 맵 (한눈에 전체 보기)
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                현 단계를 1승하면 다음 수읽기 레벨이 언락되며, 3패를 기록하면 아래 단계로 강등됩니다!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Challenge Rule Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(56, 189, 248, 0.14))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.8rem',
          marginBottom: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <Flame size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.74rem', lineHeight: 1.3, color: '#f1f5f9' }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.8rem', marginRight: '6px' }}>
              ⚔️ 승단 / 강등 규칙:
            </strong>
            <span>
              • <strong>승급 규칙</strong>: 최고 해금 단계에서 <strong>1승만 거두면 다음 단계 언락!</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              • <strong>강등 규칙</strong>: 누적 <strong>3패 달성 시 1단계 아래 강등</strong> (현재 누적: <strong style={{ color: '#ef4444' }}>{currentRankLosses}패</strong> / 3패 시 강등)
            </span>
          </div>
        </div>

        {/* Ranks Quest Map Grid - Fixed 4 Columns, Zero Scrollbar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.55rem',
          overflow: 'hidden', // Completely eliminate scrollbars
          flex: 1
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
                    ? `2px solid ${theme.accent}`
                    : isCurrentChallenge
                      ? '2px solid #fbbf24'
                      : isCleared
                        ? `1.5px solid ${theme.border}`
                        : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.65rem',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.2rem',
                  boxShadow: isSelected
                    ? `0 0 18px ${theme.glow}`
                    : isCurrentChallenge
                      ? '0 0 14px rgba(245, 158, 11, 0.4)'
                      : 'none',
                  opacity: isUnlocked ? 1 : 0.4,
                  overflow: 'hidden'
                }}
              >
                {/* Header Line inside card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {theme.icon}
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, color: theme.accent, letterSpacing: '0.4px' }}>
                      STAGE {idx + 1}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCurrentChallenge && (
                      <span style={{
                        background: '#fbbf24', color: '#0f172a', fontSize: '0.6rem', fontWeight: 900,
                        padding: '1px 5px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(245,158,11,0.4)',
                        display: 'inline-flex', alignItems: 'center', gap: '2px'
                      }}>
                        ⭐ 도전 중
                      </span>
                    )}
                    {isCleared && !isCurrentChallenge && (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.85)', color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                        padding: '1px 5px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px'
                      }}>
                        <CheckCircle2 size={10} /> 완료
                      </span>
                    )}
                    {!isUnlocked && (
                      <span style={{
                        background: 'rgba(71, 85, 105, 0.75)', color: '#cbd5e1', fontSize: '0.6rem', fontWeight: 700,
                        padding: '1px 5px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px'
                      }}>
                        <Lock size={10} /> 잠김
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage Title */}
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isUnlocked ? '#f8fafc' : '#94a3b8', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rank.name}
                </div>

                {/* Short Description */}
                <div style={{ fontSize: '0.66rem', color: isUnlocked ? '#cbd5e1' : '#64748b', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rank.description}
                </div>

                {/* Search Depth Bar */}
                <div style={{
                  fontSize: '0.65rem', fontWeight: 800, color: isUnlocked ? theme.accent : '#64748b',
                  background: isUnlocked ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
                  padding: '2px 4px', borderRadius: '4px', textAlign: 'center',
                  border: `1px solid ${isUnlocked ? theme.border : 'transparent'}`,
                  whiteSpace: 'nowrap', overflow: 'hidden'
                }}>
                  탐색: {rank.searchDepth}수 ({rank.mctsSimulations}회)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
