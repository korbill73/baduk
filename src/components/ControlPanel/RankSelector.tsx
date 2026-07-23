import React from 'react';
import type { RankInfo } from '../../types/go';
import { RANKS_DATA } from '../../data/tsumegoPuzzles';
import { X, Award, CheckCircle2, Lock, Sparkles, Trophy, Flame } from 'lucide-react';
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
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.6rem',
        position: 'relative',
        border: '1px solid #fbbf24',
        boxShadow: '0 0 50px rgba(245, 158, 11, 0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={28} color="#fbbf24" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                🎮 AI 수읽기 승급 챌린지 스테이지 맵
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                현 단계를 1승하면 다음 수읽기 레벨이 해금되며, 3패를 기록하면 아래 단계로 강등됩니다!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.45rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Challenge Rule Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.15))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <Flame size={26} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.83rem', lineHeight: 1.45 }}>
            <strong style={{ color: '#fbbf24', display: 'block', fontSize: '0.92rem', marginBottom: '2px' }}>
              ⚔️ 승단 / 강등 챌린지 규칙 안내
            </strong>
            <span style={{ color: '#e2e8f0' }}>
              • <strong>승급 규칙</strong>: 최고 해금 단계에서 <strong>단 1승만 거두면 다음 단계가 언락</strong>됩니다!
              <br />
              • <strong>강등 규칙</strong>: 도전 중 <strong>누적 3패 달성 시 이전 단계로 강등</strong>됩니다. (현재 누적 패배: <strong style={{ color: '#ef4444' }}>{currentRankLosses}패</strong> / 3패 시 강등)
            </span>
          </div>
        </div>

        {/* Ranks Quest Map Grid */}
        <div style={{
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '0.85rem',
          paddingRight: '0.4rem',
          maxHeight: '52vh'
        }}>
          {RANKS_DATA.map((rank, idx) => {
            const isSelected = rank.id === currentRank.id;
            const isUnlocked = idx <= maxUnlockedRankIndex;
            const isCleared = idx < maxUnlockedRankIndex;
            const isCurrentChallenge = idx === maxUnlockedRankIndex;

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
                    ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(15, 23, 42, 0.95))'
                    : isUnlocked
                      ? 'rgba(30, 41, 59, 0.75)'
                      : 'rgba(15, 23, 42, 0.4)',
                  border: `2px solid ${
                    isSelected
                      ? '#38bdf8'
                      : isCurrentChallenge
                        ? '#fbbf24'
                        : isCleared
                          ? '#10b981'
                          : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.95rem 1rem',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  opacity: isUnlocked ? 1 : 0.55
                }}
              >
                {/* Badge top right */}
                {isCurrentChallenge && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '10px',
                    background: '#fbbf24', color: '#0f172a', fontSize: '0.68rem', fontWeight: 900,
                    padding: '2px 8px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(245,158,11,0.5)'
                  }}>
                    ⭐ 현재 도전 레벨
                  </div>
                )}
                {isCleared && !isCurrentChallenge && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '10px',
                    background: '#10b981', color: '#fff', fontSize: '0.68rem', fontWeight: 800,
                    padding: '2px 8px', borderRadius: '12px'
                  }}>
                    ✓ 정복 완료
                  </div>
                )}
                {!isUnlocked && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '10px',
                    background: '#475569', color: '#cbd5e1', fontSize: '0.68rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '12px'
                  }}>
                    🔒 잠김
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rank.badgeColor }}>
                    STAGE {idx + 1}
                  </span>
                  {isUnlocked ? (
                    isSelected ? <Award size={18} color="#38bdf8" /> : isCleared ? <CheckCircle2 size={18} color="#10b981" /> : <Sparkles size={16} color="#fbbf24" />
                  ) : (
                    <Lock size={16} color="#94a3b8" />
                  )}
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: isUnlocked ? '#f8fafc' : '#94a3b8' }}>
                  {rank.name}
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  {rank.description}
                </div>

                <div style={{
                  fontSize: '0.72rem', fontWeight: 700, color: rank.badgeColor,
                  background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px', marginTop: '2px', textAlign: 'center'
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
