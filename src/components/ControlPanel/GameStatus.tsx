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
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth <= 960);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
      wordBreak: 'keep-all'
    }}>
      {/* ===== 1. 하단 액션 버튼 4개 (무르기, 통과, 계가, 기권) ===== */}
      {(mode === 'play' || mode === 'pvp') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.35rem' }}>
          <button
            onClick={onUndo} disabled={!canUndo || isThinking}
            className="glass-button"
            style={{ justifyContent: 'center', padding: '0.5rem 0.2rem', fontSize: '0.8rem', fontWeight: 800, opacity: !canUndo || isThinking ? 0.4 : 1 }}
            title="한 수 무르기"
          >
            <Undo2 size={14} /> 무르기
          </button>
          <button
            onClick={onPass} disabled={isThinking || gameOver}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(245,158,11,0.5)',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(180,100,0,0.3))',
              color: '#fbbf24', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
              opacity: isThinking || gameOver ? 0.4 : 1,
            }}
          >
            <SkipForward size={14} /> 통과
          </button>
          <button
            onClick={onOpenScoring}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56,189,248,0.5)',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(37,99,235,0.3))',
              color: '#38bdf8', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
            }}
          >
            <PieChart size={14} /> 계가
          </button>
          <button
            onClick={onResign} disabled={isThinking || gameOver}
            style={{
              padding: '0.5rem 0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(244,63,94,0.5)',
              background: 'linear-gradient(135deg, rgba(244,63,94,0.22), rgba(185,28,28,0.28))',
              color: '#f43f5e', fontWeight: 800, cursor: 'pointer',
              fontSize: '0.8rem', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '2px',
              opacity: isThinking || gameOver ? 0.4 : 1,
            }}
          >
            <Flag size={14} /> 기권
          </button>
        </div>
      )}

      {/* ===== 2. 대국 프로필 카드 (PC: 웅장한 대형 카드, 모바일: 콤팩트 카드) ===== */}
      <div className="glass-panel" style={{
        padding: isMobile ? '0.45rem 0.65rem' : '0.8rem 1rem',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))',
        border: '1px solid rgba(56, 189, 248, 0.25)'
      }}>
        {!isMobile ? (
          /* PC 데스크탑용 웅장한 대형 VS 프로필 카드 */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            {/* 나 (흑/사용자) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: `2px solid ${userColor === 'black' ? '#38bdf8' : '#fbbf24'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: `0 0 12px ${userColor === 'black' ? 'rgba(56,189,248,0.4)' : 'rgba(245,158,11,0.4)'}`
                }}>
                  🎮
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: userColor === 'black' ? '#000' : '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {myNickname || '나'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>
                  {myRankTitle || '아마'}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${userColor === 'black' ? 'rgba(56,189,248,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: '20px', padding: '2px 10px',
                fontSize: '0.78rem', fontWeight: 800,
                color: userColor === 'black' ? '#38bdf8' : '#fbbf24',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: userColor === 'black' ? '#000' : '#fff'
                }} />
                잡은 돌: {userColor === 'black' ? capturesBlack : capturesWhite}
              </div>
            </div>

            {/* VS 중앙 표식 & 생각 중 인디케이터 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>VS</div>
              {isThinking && (
                <div style={{
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: '#22c55e',
                  animation: 'pulse 0.8s infinite',
                  boxShadow: '0 0 8px #22c55e'
                }} />
              )}
            </div>

            {/* 상대 (AI/상대방) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2d1f1f, #1a0f0f)',
                  border: `2px solid ${isThinking ? '#22c55e' : (userColor === 'black' ? '#f59e0b' : '#38bdf8')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: isThinking ? '0 0 14px rgba(34,197,94,0.6)' : 'none'
                }}>
                  {isAiMode ? '🤖' : '👤'}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: userColor === 'white' ? '#000' : '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {isAiMode ? `AI ${aiRankName || ''}` : '상대방'}
                </div>
                <div style={{ fontSize: '0.74rem', color: isAiMode ? '#22c55e' : '#a78bfa', fontWeight: 700 }}>
                  {isAiMode ? '인공지능' : '바둑 기사'}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${userColor === 'white' ? 'rgba(56,189,248,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: '20px', padding: '2px 10px',
                fontSize: '0.78rem', fontWeight: 800,
                color: userColor === 'white' ? '#38bdf8' : '#fbbf24',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: userColor === 'white' ? '#000' : '#fff'
                }} />
                잡은 돌: {userColor === 'white' ? capturesBlack : capturesWhite}
              </div>
            </div>
          </div>
        ) : (
          /* 모바일 전용 슬림 콤팩트 1행 프로필 카드 */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '2px solid #38bdf8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  🎮
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {myNickname || '나'} <span style={{ fontSize: '0.66rem', color: '#fbbf24', fontWeight: 600 }}>({myRankTitle || '아마'})</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                  잡은 돌: {userColor === 'black' ? capturesBlack : capturesWhite}개
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', flexShrink: 0, padding: '0 2px' }}>
              VS
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isAiMode ? `AI ${aiRankName || ''}` : '상대방'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                  잡은 돌: {userColor === 'white' ? capturesBlack : capturesWhite}개
                </div>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2d1f1f, #1a0f0f)',
                  border: `2px solid ${isThinking ? '#22c55e' : '#f59e0b'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {isAiMode ? '🤖' : '👤'}
                </div>
              </div>
            </div>
          </div>
        )}

        {gameOver && resultMessage && (
          <div style={{ marginTop: '0.35rem', textAlign: 'center', fontSize: '0.74rem', color: '#fbbf24', fontWeight: 800 }}>
            🏁 {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};
