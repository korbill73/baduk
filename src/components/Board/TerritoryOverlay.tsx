import React from 'react';
import type { TerritoryMap } from '../../types/go';

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
  const isBlackLeading = blackTotal > whiteTotal;

  // Win rate segmentation for colored bar
  // 0% = all white, 100% = all black
  const blackBarW = Math.max(2, Math.min(98, winRateBlack));
  const whiteBarW = 100 - blackBarW;

  return (
    <div className="glass-panel" style={{
      padding: '0.85rem 1rem',
      background: 'linear-gradient(145deg, rgba(8,18,38,0.97), rgba(12,25,50,0.98))',
      border: '1px solid rgba(56,189,248,0.2)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
            📊 AI 형세 판단
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            background: isBlackLeading ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.12)',
            color: isBlackLeading ? '#38bdf8' : '#e2e8f0',
            padding: '2px 7px', borderRadius: '8px',
            border: `1px solid ${isBlackLeading ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.15)'}`
          }}>
            {leader} {diff}집 우세
          </span>
        </div>
        <button
          onClick={onToggleTerritory}
          style={{
            padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600,
            borderRadius: '8px', cursor: 'pointer',
            border: `1px solid ${showTerritory ? 'rgba(56,189,248,0.6)' : 'rgba(255,255,255,0.15)'}`,
            background: showTerritory ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.05)',
            color: showTerritory ? '#38bdf8' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          {showTerritory ? '영역 OFF' : '영역 ON'}
        </button>
      </div>

      {/* ===== 한게임 스타일 형세바 ===== */}
      <div>
        {/* 양쪽 플레이어 레이블 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #555, #0e1013)',
              border: '1px solid rgba(255,255,255,0.15)',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>흑</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>백</span>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #fff, #cbd5e1)',
              border: '1px solid rgba(0,0,0,0.2)',
              flexShrink: 0
            }} />
          </div>
        </div>

        {/* 형세 진행 바 (한게임 스타일 두꺼운 바) */}
        <div style={{
          width: '100%', height: '22px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '11px', overflow: 'hidden',
          display: 'flex',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
        }}>
          {/* 흑 영역 */}
          <div style={{
            width: `${blackBarW}%`,
            background: `linear-gradient(90deg, #1a2940 0%, #243856 40%, ${isBlackLeading ? '#38bdf8' : '#334155'} 100%)`,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', alignItems: 'center', paddingLeft: '10px',
            minWidth: blackBarW > 15 ? 'unset' : '0',
            overflow: 'hidden',
          }}>
            {blackBarW > 20 && (
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
                {winRateBlack}%
              </span>
            )}
          </div>
          {/* 백 영역 */}
          <div style={{
            width: `${whiteBarW}%`,
            background: `linear-gradient(90deg, ${!isBlackLeading ? '#d4d8e0' : '#8899aa'} 0%, #e8ecf2 60%, #f1f5f9 100%)`,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px',
            overflow: 'hidden',
          }}>
            {whiteBarW > 20 && (
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap' }}>
                {winRateWhite}%
              </span>
            )}
          </div>

          {/* 중앙 분리선 */}
          <div style={{
            position: 'absolute', left: `${blackBarW}%`,
            top: 0, bottom: 0, width: '2px',
            background: '#fbbf24',
            transform: 'translateX(-50%)',
            transition: 'left 0.7s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 6px rgba(251,191,36,0.8)',
            zIndex: 2
          }} />
        </div>

        {/* 집 수 표시 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: isBlackLeading ? '#38bdf8' : '#94a3b8' }}>
              {blackTotal.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '3px' }}>집</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: !isBlackLeading ? '#e2e8f0' : '#94a3b8' }}>
              {whiteTotal.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '3px' }}>집</span>
          </div>
        </div>
      </div>

      {/* ===== 세부 승률 게이지 ===== */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '10px',
        padding: '0.5rem 0.75rem',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
          승리 예상 확률
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {/* 흑 승률 */}
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#38bdf8', minWidth: '45px' }}>
            {winRateBlack}%
          </div>
          {/* 승률 바 */}
          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{
              width: `${winRateBlack}%`,
              background: 'linear-gradient(90deg, #1e40af, #38bdf8)',
              borderRadius: '4px 0 0 4px',
              transition: 'width 0.6s ease',
            }} />
            <div style={{
              width: `${winRateWhite}%`,
              background: 'linear-gradient(90deg, #d1d5db, #f1f5f9)',
              borderRadius: '0 4px 4px 0',
              transition: 'width 0.6s ease',
            }} />
          </div>
          {/* 백 승률 */}
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#e2e8f0', minWidth: '45px', textAlign: 'right' }}>
            {winRateWhite}%
          </div>
        </div>
        {/* 우세 메시지 */}
        <div style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.73rem', fontWeight: 700 }}>
          <span style={{ color: isBlackLeading ? '#38bdf8' : '#e2e8f0' }}>
            {leader === '흑' ? '⚫' : '⚪'} {leader}이 {diff}집 앞서고 있습니다
          </span>
          {diff < 5 && (
            <span style={{ color: '#fbbf24', marginLeft: '6px' }}>
              ⚖️ 박빙
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
