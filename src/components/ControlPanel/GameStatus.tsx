import type { GameMode } from '../../types/go';
import { Flag, SkipForward, Undo2, Redo2, Trophy, Loader2, PieChart } from 'lucide-react';

interface GameStatusProps {
  mode: GameMode;
  turn: 'black' | 'white';
  userColor: 'black' | 'white';
  capturesBlack: number;
  capturesWhite: number;
  komi: number;
  isThinking: boolean;
  gameOver: boolean;
  resultMessage: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onPass: () => void;
  onResign: () => void;
  onOpenScoring: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  mode,
  turn,
  userColor,
  capturesBlack,
  capturesWhite,
  komi,
  isThinking,
  gameOver,
  resultMessage,
  onUndo,
  onRedo,
  onPass,
  onResign,
  onOpenScoring,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Current Turn / Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: turn === 'black' ? 'radial-gradient(#333, #0e1013)' : 'radial-gradient(#fff, #cbd5e1)',
            border: turn === 'black' ? '2px solid #38bdf8' : '2px solid #f59e0b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }} />
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {turn === 'black' ? '흑 (Black)' : '백 (White)'} 차례
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
              ({mode === 'pvp' ? (turn === 'black' ? '1:1 플레이어 1' : '1:1 플레이어 2') : (turn === userColor ? '사용자' : 'AI 인공지능')})
            </span>
          </div>
        </div>

        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.88rem' }}>
            <Loader2 className="animate-spin" size={16} />
            <span>AI 수읽기 중...</span>
          </div>
        )}
      </div>

      {/* Result Banner when Game Over */}
      {gameOver && resultMessage && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
          border: '1px solid var(--accent-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy size={28} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>대국 종료!</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '2px' }}>{resultMessage}</p>
            </div>
          </div>
          <button
            onClick={onOpenScoring}
            className="glass-button"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderColor: '#fbbf24',
              color: '#fff',
              fontWeight: 700,
              padding: '0.6rem 1rem',
              justifyContent: 'center',
              fontSize: '0.92rem',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
            }}
          >
            <PieChart size={18} /> 정밀 계가(집 계산) 및 사석 판독 창 열기
          </button>
        </div>
      )}

      {/* Captures & Komi stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>흑이 따낸 돌 (Captures)</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{capturesBlack} 개</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>백이 따낸 돌 (+ 덤 {komi}집)</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{capturesWhite} 개</span>
        </div>
      </div>

      {/* Action Buttons */}
      {(mode === 'play' || mode === 'pvp') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={onUndo}
              disabled={!canUndo || isThinking}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', opacity: !canUndo || isThinking ? 0.4 : 1 }}
              title="한 수 무르기 (Undo)"
            >
              <Undo2 size={16} /> 무르기
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo || isThinking}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', opacity: !canRedo || isThinking ? 0.4 : 1 }}
              title="다시 놓기 (Redo)"
            >
              <Redo2 size={16} /> 다시 놓기
            </button>
            <button
              onClick={onPass}
              disabled={isThinking || gameOver}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <SkipForward size={16} color="var(--accent-gold)" /> 한수 쉼
            </button>
            <button
              onClick={onResign}
              disabled={isThinking || gameOver}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Flag size={16} color="var(--accent-rose)" /> 기권패
            </button>
          </div>

          <button
            onClick={onOpenScoring}
            className="glass-button"
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              justifyContent: 'center',
              background: 'rgba(56, 189, 248, 0.15)',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <PieChart size={17} /> ⚖️ 계가(집 계산) 및 사석 판독 신청
          </button>
        </div>
      )}
    </div>
  );
};
