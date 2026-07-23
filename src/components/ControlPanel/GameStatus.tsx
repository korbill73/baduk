import React from 'react';
import type { GameMode } from '../../types/go';
import { Flag, SkipForward, Undo2, PieChart } from 'lucide-react';

interface GameStatusProps {
  mode: GameMode;
  turn: 'black' | 'white';
  userColor: 'black' | 'white';
  capturesBlack: number;
  capturesWhite: number;
  komi?: number;
  isThinking: boolean;
  gameOver: boolean;
  resultMessage: string | null;
  onUndo: () => void;
  onRedo?: () => void;
  onPass: () => void;
  onResign: () => void;
  onOpenScoring: () => void;
  canUndo: boolean;
  canRedo?: boolean;
  myNickname?: string;
  myRankTitle?: string;
  myStats?: any;
  aiRankName?: string;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  mode,
  userColor,
  capturesBlack,
  capturesWhite,
  isThinking,
  gameOver,
  resultMessage,
  onUndo,
  onPass,
  onResign,
  onOpenScoring,
  canUndo,
  myNickname,
  myRankTitle,
  aiRankName,
}) => {
  const isAiMode = mode === 'play';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      wordBreak: 'keep-all'
    }}>
      {/* ===== 1. 하단 액션 버튼 4개 (판 바로 밑 배치: 무르기, 통과, 계가, 기권) ===== */}
      {(mode === 'play' || mode === 'pvp') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.3rem' }}>
          <button
            onClick={onUndo} disabled={!canUndo || isThinking}
            className="glass-button"
            style={{ justifyContent: 'center', padding: '0.45rem 0.2rem', fontSize: '0.78rem', fontWeight: 800, opacity: !canUndo || isThinking ? 0.4 : 1 }}
            title="한 수 무르기"
          >
            <Undo2 size={14} /> 무르기
          </button>
          <button
            onClick={onPass} disabled={isThinking || gameOver}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(245,158,11,0.5)',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(180,100,0,0.3))',
              color: '#fbbf24', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.78rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
              opacity: isThinking || gameOver ? 0.4 : 1,
            }}
          >
            <SkipForward size={14} /> 통과
          </button>
          <button
            onClick={onOpenScoring}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56,189,248,0.5)',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(37,99,235,0.3))',
              color: '#38bdf8', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.78rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
            }}
          >
            <PieChart size={14} /> 계가
          </button>
          <button
            onClick={onResign} disabled={isThinking || gameOver}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244,63,94,0.5)',
              background: 'linear-gradient(135deg, rgba(244,63,94,0.22), rgba(185,28,28,0.28))',
              color: '#f43f5e', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.78rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
              opacity: isThinking || gameOver ? 0.4 : 1,
            }}
          >
            <Flag size={14} /> 기권
          </button>
        </div>
      )}

      {/* ===== 2. 슬림 캐릭터 프로필 카드 (세로 높이 대폭 다이어트 & 잡은 돌 통합) ===== */}
      <div className="glass-panel" style={{
        padding: '0.45rem 0.65rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          
          {/* 나 (플레이어) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '2px solid #38bdf8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 0 8px rgba(56, 189, 248, 0.35)'
              }}>
                🎮
              </div>
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '13px', height: '13px', borderRadius: '50%',
                background: userColor === 'black' ? '#000' : '#fff',
                border: '1px solid #38bdf8'
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {myNickname || '나'} <span style={{ fontSize: '0.66rem', color: '#fbbf24', fontWeight: 600 }}>({myRankTitle || '아마'})</span>
              </div>
              {/* 아이콘 옆 잡은 돌 표시 */}
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span>🎯 잡은 돌:</span>
                <strong style={{ color: '#fff' }}>{userColor === 'black' ? capturesBlack : capturesWhite}개</strong>
              </div>
            </div>
          </div>

          {/* VS 중앙 표식 */}
          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', flexShrink: 0, padding: '0 2px' }}>
            VS
          </div>

          {/* 상대 (AI / opponent) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAiMode ? `AI ${aiRankName || ''}` : '상대방'}
              </div>
              {/* 상대 잡은 돌 표시 */}
              <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span>🎯 잡은 돌:</span>
                <strong style={{ color: '#fff' }}>{userColor === 'white' ? capturesBlack : capturesWhite}개</strong>
              </div>
            </div>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d1f1f, #1a0f0f)',
                border: `2px solid ${isThinking ? '#22c55e' : '#f59e0b'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: isThinking ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none'
              }}>
                {isAiMode ? '🤖' : '👤'}
              </div>
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '13px', height: '13px', borderRadius: '50%',
                background: userColor === 'white' ? '#000' : '#fff',
                border: '1px solid #f59e0b'
              }} />
            </div>
          </div>

        </div>

        {gameOver && resultMessage && (
          <div style={{ marginTop: '0.2rem', textAlign: 'center', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800 }}>
            🏁 {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};
