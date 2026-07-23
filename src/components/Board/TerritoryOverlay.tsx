import React from 'react';
import type { TerritoryMap } from '../../types/go';

interface TerritoryOverlayProps {
  map: TerritoryMap | null;
  showTerritory: boolean;
  onToggleTerritory: () => void;
  userColor?: 'black' | 'white';
}

export const TerritoryOverlay: React.FC<TerritoryOverlayProps> = ({
  map,
  showTerritory,
  onToggleTerritory,
  userColor = 'black'
}) => {
  if (!map) return null;

  const blackTotal = map.blackScore;
  const whiteTotal = map.whiteScore;
  const winRateBlack = map.estimatedWinRate;
  const winRateWhite = Math.round((100 - winRateBlack) * 10) / 10;
  const diff = Math.abs(Math.round((blackTotal - whiteTotal) * 10) / 10);
  const leader = blackTotal > whiteTotal ? '흑' : '백';
  const isBlackLeading = blackTotal > whiteTotal;

  // Determine user's win rate and color
  const isUserBlack = userColor === 'black';
  const userWinRate = isUserBlack ? winRateBlack : winRateWhite;

  // Segment widths
  const blackBarW = Math.max(3, Math.min(97, winRateBlack));
  const whiteBarW = 100 - blackBarW;

  return (
    <div className="glass-panel" style={{
      padding: '0.65rem 0.85rem',
      background: 'linear-gradient(145deg, rgba(8,18,38,0.98), rgba(12,25,50,0.99))',
      border: '1.5px solid #fbbf24',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
      boxShadow: '0 4px 18px rgba(0,0,0,0.5)'
    }}>
      {/* Header Line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px' }}>
            📊 AI 형세 판단
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 800,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35))',
            color: '#facc15',
            padding: '2px 7px', borderRadius: '8px',
            border: '1px solid rgba(245, 158, 11, 0.5)'
          }}>
            {leader} {diff}집 우세
          </span>
        </div>
        <button
          onClick={onToggleTerritory}
          style={{
            padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
            borderRadius: '6px', cursor: 'pointer',
            border: `1px solid ${showTerritory ? '#fbbf24' : 'rgba(255,255,255,0.2)'}`,
            background: showTerritory ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)',
            color: showTerritory ? '#fbbf24' : '#cbd5e1',
            transition: 'all 0.2s',
          }}
        >
          {showTerritory ? '영역 OFF' : '영역 ON'}
        </button>
      </div>

      {/* ===== Single Unified High-Visibility Win-Rate Gauge Bar ===== */}
      <div>
        {/* Top Labels: Black vs White with Neon Yellow Highlight for User */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #666, #000)',
              border: '1px solid rgba(255,255,255,0.3)'
            }} />
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              color: isUserBlack ? '#facc15' : '#cbd5e1'
            }}>
              흑 {isUserBlack && '(나)'}
            </span>
          </div>

          {/* Center User Win Rate Glowing Neon Yellow Tag */}
          <div style={{
            fontSize: '0.74rem',
            fontWeight: 900,
            color: '#0f172a',
            background: 'linear-gradient(90deg, #facc15, #fbbf24)',
            padding: '1px 8px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
            animation: 'pulse 1.8s infinite'
          }}>
            ⚡ 승률: {userWinRate}%
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 900,
              color: !isUserBlack ? '#facc15' : '#cbd5e1'
            }}>
              백 {!isUserBlack && '(나)'}
            </span>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #fff, #cbd5e1)',
              border: '1px solid rgba(0,0,0,0.3)'
            }} />
          </div>
        </div>

        {/* Single Glowing Progress Gauge */}
        <div style={{
          width: '100%', height: '18px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '9px', overflow: 'hidden',
          display: 'flex',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
        }}>
          {/* Black Segment */}
          <div style={{
            width: `${blackBarW}%`,
            background: isUserBlack
              ? 'linear-gradient(90deg, #ca8a04, #facc15)'
              : 'linear-gradient(90deg, #1e293b, #334155)',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', alignItems: 'center', paddingLeft: '8px',
            overflow: 'hidden',
            boxShadow: isUserBlack ? '0 0 12px rgba(250, 204, 21, 0.6)' : 'none'
          }}>
            {blackBarW > 15 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: isUserBlack ? '#0f172a' : '#fff' }}>
                {winRateBlack}%
              </span>
            )}
          </div>

          {/* White Segment */}
          <div style={{
            width: `${whiteBarW}%`,
            background: !isUserBlack
              ? 'linear-gradient(90deg, #facc15, #fef08a)'
              : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px',
            overflow: 'hidden',
            boxShadow: !isUserBlack ? '0 0 12px rgba(250, 204, 21, 0.6)' : 'none'
          }}>
            {whiteBarW > 15 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a' }}>
                {winRateWhite}%
              </span>
            )}
          </div>

          {/* Divider Line */}
          <div style={{
            position: 'absolute', left: `${blackBarW}%`,
            top: 0, bottom: 0, width: '2.5px',
            background: '#ffffff',
            transform: 'translateX(-50%)',
            transition: 'left 0.6s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 8px #ffffff',
            zIndex: 2
          }} />
        </div>

        {/* Territory Scores Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: isBlackLeading ? '#facc15' : '#cbd5e1' }}>
            {blackTotal.toFixed(1)} <span style={{ fontSize: '0.66rem', fontWeight: 500 }}>집</span>
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>
            {leader === '흑' ? '⚫' : '⚪'} {leader}이 {diff}집 앞서는 중
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: !isBlackLeading ? '#facc15' : '#cbd5e1' }}>
            {whiteTotal.toFixed(1)} <span style={{ fontSize: '0.66rem', fontWeight: 500 }}>집</span>
          </div>
        </div>
      </div>
    </div>
  );
};
