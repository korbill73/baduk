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
    <div className="glass-panel" style={{
      padding: '0.8rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      wordBreak: 'keep-all',
      whiteSpace: 'nowrap'
    }}>
      {/* Current Turn / Status (No English) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: turn === 'black' ? 'radial-gradient(#333, #0e1013)' : 'radial-gradient(#fff, #cbd5e1)',
            border: turn === 'black' ? '2px solid #38bdf8' : '2px solid #f59e0b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            flexShrink: 0
          }} />
          <div>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
              {turn === 'black' ? '흑 차례' : '백 차례'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
              ({mode === 'pvp' ? (turn === 'black' ? '1:1 흑' : '1:1 백') : (turn === userColor ? '사용자' : 'AI 인공지능')})
            </span>
          </div>
        </div>

        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.82rem' }}>
            <Loader2 className="animate-spin" size={15} />
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
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          whiteSpace: 'normal'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={22} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.92rem' }}>대국 종료!</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>{resultMessage}</p>
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
              padding: '0.48rem 0.8rem',
              justifyContent: 'center',
              fontSize: '0.84rem'
            }}
          >
            <PieChart size={16} /> 정밀 계가 및 사석 판독 창 열기
          </button>
        </div>
      )}

      {/* Captures & Komi stats grid (No English, Single line title) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>흑 따낸 돌</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>{capturesBlack}개</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>백 따낸 돌 (덤 {komi})</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{capturesWhite}개</span>
        </div>
      </div>

      {/* Action Buttons in a compact 2x2 grid so they never character wrap */}
      {(mode === 'play' || mode === 'pvp') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
            <button
              onClick={onUndo}
              disabled={!canUndo || isThinking}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.42rem 0.5rem', fontSize: '0.82rem', opacity: !canUndo || isThinking ? 0.4 : 1 }}
              title="한 수 무르기"
            >
              <Undo2 size={15} /> 무르기
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo || isThinking}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.42rem 0.5rem', fontSize: '0.82rem', opacity: !canRedo || isThinking ? 0.4 : 1 }}
              title="다시 놓기"
            >
              <Redo2 size={15} /> 다시 놓기
            </button>
            <button
              onClick={onPass}
              disabled={isThinking || gameOver}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.42rem 0.5rem', fontSize: '0.82rem', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <SkipForward size={15} color="var(--accent-gold)" /> 한수 쉼
            </button>
            <button
              onClick={onResign}
              disabled={isThinking || gameOver}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.42rem 0.5rem', fontSize: '0.82rem', background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Flag size={15} color="var(--accent-rose)" /> 기권패
            </button>
          </div>

          <button
            onClick={onOpenScoring}
            className="glass-button"
            style={{
              width: '100%',
              padding: '0.48rem 0.8rem',
              justifyContent: 'center',
              background: 'rgba(56, 189, 248, 0.15)',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.84rem'
            }}
          >
            <PieChart size={16} /> ⚖️ 계가 및 사석 판독 신청
          </button>
        </div>
      )}
    </div>
  );
};
