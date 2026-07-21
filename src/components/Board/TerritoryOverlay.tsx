import type { TerritoryMap } from '../../types/go';
import { PieChart, TrendingUp } from 'lucide-react';

interface TerritoryOverlayProps {
  map: TerritoryMap | null;
  showTerritory: boolean;
  onToggleTerritory: () => void;
}

export const TerritoryOverlay: React.FC<TerritoryOverlayProps> = ({
  map,
  showTerritory,
  onToggleTerritory,
}) => {
  if (!map) return null;

  const blackTotal = map.blackScore;
  const whiteTotal = map.whiteScore;
  const winRateBlack = map.estimatedWinRate;
  const winRateWhite = Math.round((100 - winRateBlack) * 10) / 10;
  const diff = Math.abs(Math.round((blackTotal - whiteTotal) * 10) / 10);
  const leader = blackTotal > whiteTotal ? '흑' : '백';

  return (
    <div className="glass-panel" style={{
      padding: '0.9rem 1.2rem',
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PieChart size={18} color="var(--accent-blue)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI 실시간 형세 판단 (집 계산 및 승률 예측)</span>
        </div>
        <button
          onClick={onToggleTerritory}
          className="glass-button"
          style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem', background: showTerritory ? 'rgba(56, 189, 248, 0.2)' : 'transparent' }}
        >
          {showTerritory ? '판 위 영역 표시 끄기' : '판 위 영역 시각화 켜기'}
        </button>
      </div>

      {/* Win rate bar */}
      <div style={{ width: '100%', height: '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
        <div style={{
          width: `${winRateBlack}%`,
          background: 'linear-gradient(90deg, #1e293b, #38bdf8)',
          transition: 'width 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '6px'
        }} />
        <div style={{
          width: `${winRateWhite}%`,
          background: 'linear-gradient(90deg, #cbd5e1, #ffffff)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>
          <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>흑 (Black): {winRateBlack}%</strong>
          <span style={{ marginLeft: '6px' }}>({map.blackTerritory.length}집 + 따냄) = <strong>{blackTotal}집</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600 }}>
          <TrendingUp size={15} />
          <span>{leader} {diff}집 우세 (덤 {map.komi}집 포함)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span>({map.whiteTerritory.length}집 + 따냄 + 덤 {map.komi}) = <strong>{whiteTotal}집</strong></span>
          <strong style={{ color: '#fff', fontSize: '0.95rem', marginLeft: '6px' }}>백 (White): {winRateWhite}%</strong>
        </div>
      </div>
    </div>
  );
};
