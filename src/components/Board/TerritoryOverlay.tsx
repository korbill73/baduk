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
      padding: '0.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      wordBreak: 'keep-all',
      whiteSpace: 'nowrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PieChart size={16} color="var(--accent-blue)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>AI 형세 판단</span>
        </div>
        <button
          onClick={onToggleTerritory}
          className="glass-button"
          style={{ padding: '0.28rem 0.65rem', fontSize: '0.78rem', background: showTerritory ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)' }}
        >
          {showTerritory ? '영역 보기 끄기' : '영역 보기 켜기'}
        </button>
      </div>

      {/* Win rate bar */}
      <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
        <div style={{
          width: `${winRateBlack}%`,
          background: 'linear-gradient(90deg, #1e293b, #38bdf8)',
          transition: 'width 0.5s ease'
        }} />
        <div style={{
          width: `${winRateWhite}%`,
          background: 'linear-gradient(90deg, #cbd5e1, #ffffff)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Stats row (No English, No Wrapping) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>흑 {winRateBlack}%</strong>
          <span>({blackTotal}집)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '2px 7px', borderRadius: '10px', fontWeight: 600, fontSize: '0.78rem' }}>
          <TrendingUp size={13} />
          <span>{leader} {diff}집 우세</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>({whiteTotal}집)</span>
          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>백 {winRateWhite}%</strong>
        </div>
      </div>
    </div>
  );
};
