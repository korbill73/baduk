import React from 'react';
import type { RankInfo } from '../../types/go';
import { Trophy, Award, ArrowRight, X, Sparkles } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface RankUpModalProps {
  unlockedRank: RankInfo;
  stageNumber: number;
  onNextStage: () => void;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({
  unlockedRank,
  stageNumber,
  onNextStage,
  onClose,
}) => {
  React.useEffect(() => {
    soundManager.playVictory();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(5, 10, 24, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      wordBreak: 'keep-all'
    }}>
      <div className="glass-panel animate-float" style={{
        width: '92vw',
        maxWidth: '480px',
        background: 'linear-gradient(145deg, rgba(20, 32, 60, 0.98), rgba(10, 18, 38, 0.99))',
        border: '2px solid #fbbf24',
        boxShadow: '0 0 70px rgba(245, 158, 11, 0.65), inset 0 0 25px rgba(245, 158, 11, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.8rem 1.6rem',
        textAlign: 'center',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="glass-button"
          style={{ position: 'absolute', top: '14px', right: '14px', padding: '0.35rem', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>

        {/* Trophy Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.2rem auto',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.85), 0 0 10px #ffffff',
          animation: 'pulseGlow 2s infinite ease-in-out'
        }}>
          <Trophy size={42} color="#ffffff" />
        </div>

        {/* Title & Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #fbbf24', borderRadius: '20px', padding: '4px 14px', marginBottom: '0.8rem' }}>
          <Sparkles size={14} color="#fbbf24" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24' }}>AI 승단 챌린지 승급 성공!</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.4px' }}>
          🎉 축하합니다! 승단 성공!
        </h2>

        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 1.4rem 0', lineHeight: 1.5 }}>
          기존 난이도를 훌륭하게 격파하셨습니다!<br />
          다음 수읽기 스테이지가 성공적으로 언락되었습니다.
        </p>

        {/* Unlocked Stage Card Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(30, 58, 110, 0.95))',
          border: '2px solid #fbbf24',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
            UNLOCKED STAGE {stageNumber}
          </div>
          <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Award size={20} color={unlockedRank.badgeColor || '#fbbf24'} />
            <span>{unlockedRank.name}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', fontWeight: 600 }}>
            {unlockedRank.description}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={() => {
              onNextStage();
              onClose();
            }}
            className="glass-button gold"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.96rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>⚡ STAGE {stageNumber} 바로 도전하기</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onClose}
            className="glass-button"
            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
          >
            확인 및 화면 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
