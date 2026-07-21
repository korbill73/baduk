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
    <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI 훈수 및 복기 코치</h3>
        </div>
        {mode === 'play' && (
          <button
            onClick={onRequestHints}
            disabled={isThinking}
            className="glass-button gold"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Compass size={15} /> AI 추천 한수 받기
          </button>
        )}
      </div>

      {/* Review Mode Navigation */}
      {mode === 'review' && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.92rem' }}>
              <BookOpen size={16} style={{ display: 'inline', marginRight: '6px' }} />
              기보 수순 분석 (총 {history.length - 1}수 중 {historyIndex}수)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onJumpToHistory(0)}
              disabled={historyIndex <= 0}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => onJumpToHistory(historyIndex - 1)}
              disabled={historyIndex <= 0}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ChevronLeft size={18} /> 이전 수
            </button>
            <button
              onClick={() => onJumpToHistory(historyIndex + 1)}
              disabled={historyIndex >= history.length - 1}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              다음 수 <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onJumpToHistory(history.length - 1)}
              disabled={historyIndex >= history.length - 1}
              className="glass-button"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ChevronsRight size={18} />
            </button>
          </div>

          {history[historyIndex]?.move && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px' }}>
              <strong>제 {historyIndex}수:</strong> {history[historyIndex].move?.color === 'black' ? '흑' : '백'} ({history[historyIndex].move?.x! + 1}, {history[historyIndex].move?.y! + 1})
              {history[historyIndex].move?.comment && ` — ${history[historyIndex].move?.comment}`}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations Cards */}
      {recommendations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MCTS 분석 상위 추천 수</span>
            <button
              onClick={onToggleHints}
              style={{
                background: 'none',
                border: 'none',
                color: showHints ? '#38bdf8' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline'
              }}
            >
              {showHints ? '판 위 마커 숨기기' : '판 위 마커 표시'}
            </button>
          </div>

          {recommendations.map((rec, idx) => {
            const badgeColor = rec.rank === 1 ? '#f59e0b' : rec.rank === 2 ? '#38bdf8' : '#10b981';
            const catColor = getCategoryColor(rec.category);

            return (
              <div
                key={idx}
                style={{
                  background: rec.rank === 1 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${rec.rank === 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      background: badgeColor,
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      #{rec.rank} 추천수
                    </span>
                    <span style={{
                      background: `${catColor}22`,
                      color: catColor,
                      border: `1px solid ${catColor}55`,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '6px'
                    }}>
                      {rec.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: rec.winRateChange >= 0 ? '#34d399' : '#f87171' }}>
                    승률 기대치: {rec.winRateChange >= 0 ? `+${rec.winRateChange}%` : `${rec.winRateChange}%`}
                  </span>
                </div>

                <p style={{ fontSize: '0.86rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                  {rec.explanation}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  좌표: ({rec.point.x + 1}, {rec.point.y + 1})
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          {isThinking ? (
            <span>AI가 최선의 수와 포석을 심층 탐색 중입니다...</span>
          ) : (
            <span>대국 중에 <strong>'AI 추천 한수 받기'</strong> 버튼을 클릭하시면 1~3위 후보수와 9단 도약을 위한 해설이 표시됩니다.</span>
          )}
        </div>
      )}
    </div>
  );
};
