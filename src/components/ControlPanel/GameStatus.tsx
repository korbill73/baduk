import React from 'react';
import type { GameMode } from '../../types/go';
import { Flag, SkipForward, Undo2, Redo2, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

interface UserStats {
  vsAiWins?: number;
  vsAiLosses?: number;
  onlineWins?: number;
  onlineLosses?: number;
  pvpWins?: number;
  pvpLosses?: number;
}

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
  myNickname?: string;
  myRankTitle?: string;
  myStats?: UserStats;
  aiRankName?: string;
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
  myNickname,
  myRankTitle,
  myStats,
  aiRankName,
}) => {
  // Compute total stats
  const totalWins = (myStats?.vsAiWins || 0) + (myStats?.onlineWins || 0) + (myStats?.pvpWins || 0);
  const totalLosses = (myStats?.vsAiLosses || 0) + (myStats?.onlineLosses || 0) + (myStats?.pvpLosses || 0);
  const totalGames = totalWins + totalLosses;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const isUserTurn = turn === userColor;
  const isAiMode = mode === 'play';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>

      {/* ===== 플레이어 대전 패널 (한게임 스타일) ===== */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1rem',
        background: 'linear-gradient(145deg, rgba(10,20,40,0.97), rgba(15,30,55,0.98))',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: 'var(--radius-lg)',
      }}>

        {/* VS 대전 레이아웃 (한게임 2번째 이미지처럼) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {/* 나 (흑/사용자) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
            {/* 프로필 아바타 */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a5f, #0f2540)',
                border: `2px solid ${userColor === 'black' ? '#38bdf8' : '#f59e0b'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', boxShadow: `0 0 12px ${userColor === 'black' ? 'rgba(56,189,248,0.4)' : 'rgba(245,158,11,0.4)'}`,
              }}>
                🎮
              </div>
              {/* 착수 표시 돌 */}
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: userColor === 'black' ? 'radial-gradient(circle at 35% 35%, #4a5568, #0e1013)' : 'radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
              }} />
            </div>

            {/* 이름/단급 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {myNickname || '나'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
                {myRankTitle || '아마'}
              </div>
            </div>

            {/* 따낸 돌 */}
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${userColor === 'black' ? 'rgba(56,189,248,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '0.8rem', fontWeight: 700,
              color: userColor === 'black' ? '#38bdf8' : '#fbbf24',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: userColor === 'black' ? '#0e1013' : '#fff',
                border: '1px solid rgba(255,255,255,0.3)'
              }} />
              {userColor === 'black' ? capturesBlack : capturesWhite}
            </div>

            {/* 내 차례 표시 */}
            {isUserTurn && !gameOver && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(37,99,235,0.4))',
                border: '1px solid #38bdf8',
                borderRadius: '10px', padding: '2px 8px',
                fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8',
                animation: 'pulse 1.5s infinite'
              }}>
                ▶ 착수 차례
              </div>
            )}
          </div>

          {/* VS 중앙 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 900,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '1px',
            }}>VS</div>
            {/* AI 생각 중 인디케이터 */}
            {isThinking && (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#22c55e',
                animation: 'pulse 0.8s infinite',
                boxShadow: '0 0 8px #22c55e'
              }} />
            )}
          </div>

          {/* 상대 (AI 또는 상대방) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d1f1f, #1a0f0f)',
                border: `2px solid ${isThinking ? '#22c55e' : (userColor === 'black' ? 'rgba(245,158,11,0.6)' : 'rgba(56,189,248,0.6)')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: isThinking ? '0 0 15px rgba(34,197,94,0.5)' : 'none',
                transition: 'box-shadow 0.3s'
              }}>
                {isAiMode ? '🤖' : '👤'}
              </div>
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: userColor === 'white' ? 'radial-gradient(circle at 35% 35%, #4a5568, #0e1013)' : 'radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
              }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isAiMode ? `AI ${aiRankName || ''}` : (mode === 'pvp' ? '상대방' : '온라인')}
              </div>
              <div style={{ fontSize: '0.72rem', color: isAiMode ? '#22c55e' : '#a78bfa', fontWeight: 600 }}>
                {isAiMode ? '인공지능' : '바둑 기사'}
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${userColor === 'white' ? 'rgba(56,189,248,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '0.8rem', fontWeight: 700,
              color: userColor === 'white' ? '#38bdf8' : '#fbbf24',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: userColor === 'white' ? '#0e1013' : '#fff',
                border: '1px solid rgba(255,255,255,0.3)'
              }} />
              {userColor === 'white' ? capturesBlack : capturesWhite}
            </div>

            {/* 상대 차례 표시 */}
            {!isUserTurn && !gameOver && (
              <div style={{
                background: isThinking
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(16,185,129,0.3))'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isThinking ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '10px', padding: '2px 8px',
                fontSize: '0.7rem', fontWeight: 700,
                color: isThinking ? '#22c55e' : 'var(--text-muted)',
              }}>
                {isThinking ? '🤖 수읽기 중' : '▶ 착수 차례'}
              </div>
            )}
          </div>
        </div>

        {/* 덤 안내 및 게임 오버 상태 */}
        <div style={{
          marginTop: '0.35rem',
          textAlign: 'center',
          fontSize: '0.68rem', color: 'var(--text-muted)'
        }}>
          {gameOver && resultMessage ? (
            <span style={{ color: '#fbbf24', fontWeight: 800 }}>🏁 {resultMessage}</span>
          ) : (
            `덤 ${komi}집 | ${userColor === 'black' ? '흑(나) 선착' : '백(나) 후착'}`
          )}
        </div>
      </div>

      {/* ===== 내 전적 통계 (대국화면 표시 - Slim) ===== */}
      {myStats && totalGames > 0 && (
        <div className="glass-panel" style={{
          padding: '0.45rem 0.65rem',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(120,80,0,0.12))',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🏆 나의 전적
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.25rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.25rem 0.2rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>총 대국</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>{totalGames}</div>
            </div>
            <div style={{ background: 'rgba(56,189,248,0.12)', borderRadius: '6px', padding: '0.25rem 0.2rem', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '0.62rem', color: '#38bdf8' }}>승</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                <TrendingUp size={11} />{totalWins}
              </div>
            </div>
            <div style={{ background: 'rgba(244,63,94,0.1)', borderRadius: '6px', padding: '0.25rem 0.2rem', border: '1px solid rgba(244,63,94,0.2)' }}>
              <div style={{ fontSize: '0.62rem', color: '#f43f5e' }}>패</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                <TrendingDown size={11} />{totalLosses}
              </div>
            </div>
            <div style={{ background: 'rgba(168,85,247,0.1)', borderRadius: '6px', padding: '0.25rem 0.2rem', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div style={{ fontSize: '0.62rem', color: '#a855f7' }}>승률</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#a855f7' }}>{winRate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 따낸 돌 / 덤 상세 ===== */}
      <div className="glass-panel" style={{
        padding: '0.45rem 0.65rem',
        background: 'rgba(10,15,30,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'stretch' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.3rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>흑 따낸 돌</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>{capturesBlack}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.3rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>백 따낸 돌</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{capturesWhite}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.3rem', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.64rem', color: '#fbbf24' }}>덤</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{komi}</div>
          </div>
        </div>
      </div>

      {/* ===== 하단 액션 버튼 ===== */}
      {(mode === 'play' || mode === 'pvp') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {/* 보조 버튼 (무르기/다시) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
            <button
              onClick={onUndo} disabled={!canUndo || isThinking}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.3rem 0.4rem', fontSize: '0.75rem', opacity: !canUndo || isThinking ? 0.4 : 1 }}
              title="한 수 무르기"
            >
              <Undo2 size={13} /> 무르기
            </button>
            <button
              onClick={onRedo} disabled={!canRedo || isThinking}
              className="glass-button"
              style={{ justifyContent: 'center', padding: '0.3rem 0.4rem', fontSize: '0.75rem', opacity: !canRedo || isThinking ? 0.4 : 1 }}
              title="다시 놓기"
            >
              <Redo2 size={13} /> 다시 놓기
            </button>
          </div>

          {/* 주요 버튼 (통과/계가/기권) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.3rem' }}>
            <button
              onClick={onPass} disabled={isThinking || gameOver}
              style={{
                padding: '0.4rem 0.3rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(245,158,11,0.5)',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(180,100,0,0.25))',
                color: '#fbbf24', fontWeight: 800, cursor: 'pointer',
                fontSize: '0.76rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '3px',
                opacity: isThinking || gameOver ? 0.4 : 1,
              }}
            >
              <SkipForward size={13} /> 통과
            </button>
            <button
              onClick={onOpenScoring}
              style={{
                padding: '0.4rem 0.3rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(56,189,248,0.5)',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(37,99,235,0.25))',
                color: '#38bdf8', fontWeight: 800, cursor: 'pointer',
                fontSize: '0.76rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '3px',
              }}
            >
              <PieChart size={13} /> 계가
            </button>
            <button
              onClick={onResign} disabled={isThinking || gameOver}
              style={{
                padding: '0.4rem 0.3rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(244,63,94,0.5)',
                background: 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(185,28,28,0.22))',
                color: '#f43f5e', fontWeight: 800, cursor: 'pointer',
                fontSize: '0.76rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '3px',
                opacity: isThinking || gameOver ? 0.4 : 1,
              }}
            >
              <Flag size={13} /> 기권
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
