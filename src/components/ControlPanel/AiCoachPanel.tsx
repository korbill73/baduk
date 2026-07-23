import type { AiRecommendation, GameMode, GameHistoryItem } from '../../types/go';
import { Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BookOpen, Compass } from 'lucide-react';

interface AiCoachPanelProps {
  mode: GameMode;
  recommendations: AiRecommendation[];
  showHints: boolean;
  onToggleHints: () => void;
  onRequestHints: () => void;
  isThinking: boolean;
  history: GameHistoryItem[];
  historyIndex: number;
  onJumpToHistory: (index: number) => void;
}

export const AiCoachPanel: React.FC<AiCoachPanelProps> = ({
  mode,
  recommendations,
  showHints,
  onToggleHints,
  onRequestHints,
  isThinking,
  history,
  historyIndex,
  onJumpToHistory,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '공격': return '#ef4444';
      case '방어': return '#3b82f6';
      case '실리': return '#10b981';
      case '세력': return '#8b5cf6';
      case '정석': return '#f59e0b';
      default: return '#0ea5e9';
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '0.8rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      wordBreak: 'keep-all',
      whiteSpace: 'nowrap'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={17} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>AI 복기 코치</h3>
        </div>
        {mode === 'play' && (
          <button
            onClick={() => {
              if (showHints) {
                onToggleHints();
              } else {
                onRequestHints();
              }
            }}
            disabled={isThinking}
            className={`glass-button ${showHints ? 'primary' : 'gold'}`}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
          >
            <Compass size={14} /> {showHints ? '추천 숨기기' : 'AI 추천 받기'}
          </button>
        )}
      </div>

      {/* Review Mode Navigation */}
      {mode === 'review' && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.82rem' }}>
              <BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />
              기보 분석 ({historyIndex} / {history.length - 1}수)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              onClick={() => onJumpToHistory(0)}
              disabled={historyIndex <= 0}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', padding: '0.3rem' }}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onJumpToHistory(historyIndex - 1)}
              disabled={historyIndex <= 0}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', padding: '0.3rem', fontSize: '0.78rem' }}
            >
              <ChevronLeft size={16} /> 이전
            </button>
            <button
              onClick={() => onJumpToHistory(historyIndex + 1)}
              disabled={historyIndex >= history.length - 1}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', padding: '0.3rem', fontSize: '0.78rem' }}
            >
              다음 <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onJumpToHistory(history.length - 1)}
              disabled={historyIndex >= history.length - 1}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center', padding: '0.3rem' }}
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          {history[historyIndex]?.move && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '4px', whiteSpace: 'normal' }}>
              <strong>제 {historyIndex}수:</strong> {history[historyIndex].move?.color === 'black' ? '흑' : '백'} ({history[historyIndex].move?.x! + 1}, {history[historyIndex].move?.y! + 1})
              {history[historyIndex].move?.comment && ` — ${history[historyIndex].move?.comment}`}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations Cards in a height-constrained box so the entire page NEVER scrolls */}
      {recommendations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>MCTS 분석 상위 추천</span>
            <button
              onClick={onToggleHints}
              style={{
                background: 'none',
                border: 'none',
                color: showHints ? '#38bdf8' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              {showHints ? '판 위 마커 숨기기' : '판 위 마커 표시'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '220px',
            overflowY: 'auto',
            paddingRight: '2px'
          }}>
            {recommendations.map((rec, idx) => {
              const badgeColor = rec.rank === 1 ? '#f59e0b' : rec.rank === 2 ? '#38bdf8' : '#10b981';
              const catColor = getCategoryColor(rec.category);

              return (
                <div
                  key={idx}
                  style={{
                    background: rec.rank === 1 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${rec.rank === 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    whiteSpace: 'normal'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        background: badgeColor,
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        #{rec.rank} 추천
                      </span>
                      <span style={{
                        background: `${catColor}22`,
                        color: catColor,
                        border: `1px solid ${catColor}55`,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {rec.category}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        좌표: ({rec.point.x + 1}, {rec.point.y + 1})
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: rec.winRateChange >= 0 ? '#34d399' : '#f87171' }}>
                      승률 {rec.winRateChange >= 0 ? `+${rec.winRateChange}%` : `${rec.winRateChange}%`}
                    </span>
                  </div>

                  <p className="hide-on-mobile" style={{ fontSize: '0.8rem', lineHeight: 1.35, color: 'var(--text-main)', margin: 0, wordBreak: 'keep-all' }}>
                    {rec.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          whiteSpace: 'normal'
        }}>
          {isThinking ? (
            <span>AI가 최선의 수를 탐색 중입니다...</span>
          ) : (
            <span><strong>'AI 추천 받기'</strong> 버튼을 누르면 1~3위 후보수와 해설이 표시됩니다.</span>
          )}
        </div>
      )}
    </div>
  );
};
