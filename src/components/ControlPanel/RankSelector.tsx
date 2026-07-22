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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>AI 수읽기 수준 (내다보는 수) 선택</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                선택하신 수읽기 단계(3수~300수)에 맞춰 KataGo AI의 탐색 깊이와 연산 속도가 자동 동기화됩니다.
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

        {/* KataGo Dynamic Scaling Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(16, 185, 129, 0.15))',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <Sparkles size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            <strong style={{ color: '#38bdf8', display: 'block', fontSize: '0.95rem', marginBottom: '4px' }}>
              ✨ 수읽기 단계별 내다보는 수 & MCTS 탐색 수 연동 시스템
            </strong>
            <span style={{ display: 'block', marginBottom: '4px' }}>
              • <strong>3수 ~ 15수 읽기 (입문/초급)</strong>: 초고속(`0.2~0.6초`) 응답과 함께 AI가 3~15수 앞을 계산하며 가벼운 대국에 적합합니다.
            </span>
            <span>
              • <strong>20수 ~ 300수 읽기 (중급~AI신계)</strong>: AI가 최대 300수 깊이까지 정밀 연산하여 사활과 승부처에서 완벽히 수읽기를 진행합니다.
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

            let visitsText = '20수 탐색 (호각)';
            let speedText = '약 1.5초';
            if (rank.id.includes('18k')) { visitsText = '3수 탐색 (입문)'; speedText = '초고속 0.2초'; }
            else if (rank.id.includes('15k')) { visitsText = '5수 탐색 (기초)'; speedText = '초고속 0.3초'; }
            else if (rank.id.includes('12k')) { visitsText = '8수 탐색 (초급)'; speedText = '쾌속 0.4초'; }
            else if (rank.id.includes('10k')) { visitsText = '10수 탐색 (초/중급)'; speedText = '쾌속 0.6초'; }
            else if (rank.id.includes('8k')) { visitsText = '15수 탐색 (중급)'; speedText = '약 1.0초'; }
            else if (rank.id.includes('6k')) { visitsText = '20수 탐색 (권장)'; speedText = '약 1.5초 (호각)'; }
            else if (rank.id.includes('4k')) { visitsText = '30수 탐색 (상급)'; speedText = '약 2.0초'; }
            else if (rank.id.includes('2k')) { visitsText = '40수 탐색 (고급)'; speedText = '약 2.6초'; }
            else if (rank.id.includes('1d')) { visitsText = '50수 탐색 (유단자)'; speedText = '약 3.3초'; }
            else if (rank.id.includes('3d')) { visitsText = '80수 탐색 (강자)'; speedText = '약 4.5초'; }
            else if (rank.id.includes('5d')) { visitsText = '120수 탐색 (사범급)'; speedText = '약 6.0초'; }
            else if (rank.id.includes('7d')) { visitsText = '200수 탐색 (정상급)'; speedText = '약 7.5초'; }
            else if (rank.id.includes('9d')) { visitsText = '300수 탐색 (AI 신계)'; speedText = '약 9.5초'; }

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
                    👑 신계 300회 탐색
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
                    6급 맞춤 추천
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
                    <Zap size={13} color="var(--accent-gold)" /> KataGo: <strong style={{ color: '#fff' }}>{visitsText}</strong>
                  </span>
                  <span style={{ color: rank.badgeColor, fontWeight: 600 }}>{speedText}</span>
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
