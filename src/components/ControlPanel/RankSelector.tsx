import React from 'react';
import type { RankInfo } from '../../types/go';
import { RANKS_DATA } from '../../data/tsumegoPuzzles';
import { X, Award, CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react';

interface RankSelectorProps {
  currentRank: RankInfo;
  onSelectRank: (rank: RankInfo) => void;
  onClose: () => void;
}

export const RankSelector: React.FC<RankSelectorProps> = ({
  currentRank,
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
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{
        width: '90%',
        maxWidth: '720px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.8rem',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={26} color="var(--accent-gold)" />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>AI 단급 (난이도) 설정 안내</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                사용자님의 요청에 맞춰 실력 구분 없이 상시 최고 수준의 AI로 구동됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Request Notice Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <Sparkles size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.95rem', marginBottom: '3px' }}>
              👑 실력 구분 없는 '최고 실력 통합 가동 모드' 작동 중
            </strong>
            <span>
              <em>"단계별 차이는 나중에 하겠습니다. 최고의 ai 실력을 구사해 주세요"</em> 요청에 따라, 현재 어떤 단급을 선택하더라도 <strong>초고속 0.15초 2-Ply Minimax 수읽기와 36수 정석이 적용된 최고 실력(`9단 AI 신계`)</strong>으로 응수합니다. (단계별 난이도 분리 기능은 추후 활성화됩니다.)
            </span>
          </div>
        </div>

        {/* Ranks Grid / List */}
        <div style={{
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.9rem',
          paddingRight: '0.5rem',
          maxHeight: '52vh'
        }}>
          {RANKS_DATA.map((rank) => {
            const isSelected = rank.id === currentRank.id;
            const isCurrentLevel = rank.name.includes('6급');
            const isTopDan = rank.name.includes('9단');
            const isDan = rank.name.includes('단');

            return (
              <div
                key={rank.id}
                onClick={() => {
                  onSelectRank(rank);
                  onClose();
                }}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : isTopDan ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: `2px solid ${isSelected ? rank.badgeColor : isTopDan ? '#ef4444' : isCurrentLevel ? '#ec4899' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {isTopDan && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
                  }}>
                    👑 상시 최고 실력 가동
                  </div>
                )}
                {isCurrentLevel && !isTopDan && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: '#ec4899',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(236, 72, 153, 0.5)'
                  }}>
                    6급 도약 출발점
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: rank.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    {isDan ? <Sparkles size={16} /> : <Shield size={16} />}
                    {rank.name}
                  </span>
                  {isSelected && <CheckCircle2 size={18} color={rank.badgeColor} />}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minHeight: '34px', lineHeight: 1.3 }}>
                  {rank.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '0.5rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Zap size={13} color="var(--accent-gold)" /> 2-Ply Minimax: <strong>초고속 가동</strong>
                  </span>
                  <span>최고 실력</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
          <button
            onClick={onClose}
            className="glass-button primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            확인 및 대국 시작
          </button>
        </div>
      </div>
    </div>
  );
};
