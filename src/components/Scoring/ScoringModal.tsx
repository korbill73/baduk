import React, { useState, useEffect, useRef } from 'react';
import { GoBoard } from '../../core/GoBoard';
import { ScoringEngine } from '../../core/Scoring';
import type { TerritoryMap } from '../../types/go';
import { Trophy, CheckCircle2, RotateCcw, Sparkles, X, AlertCircle, PieChart } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface ScoringModalProps {
  board: GoBoard;
  komi: number;
  onClose: () => void;
  onRestartGame: () => void;
}

export const ScoringModal: React.FC<ScoringModalProps> = ({
  board,
  komi,
  onClose,
  onRestartGame,
}) => {
  const [deadStones, setDeadStones] = useState<Set<string>>(new Set());
  const [territoryMap, setTerritoryMap] = useState<TerritoryMap | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const size = board.size;
  const grid = board.grid;

  // Calculate territory map dynamically whenever dead stones change
  useEffect(() => {
    const map = ScoringEngine.estimateTerritoryAndScore(board, komi, deadStones);
    setTerritoryMap(map);
  }, [board, komi, deadStones]);

  // AI Automatic Dead Stone Detection
  const handleAutoDetectDeadStones = () => {
    soundManager.playStoneClick();
    const newDead = new Set<string>();

    // Calculate baseline influence without dead stones
    const baseMap = ScoringEngine.estimateTerritoryAndScore(board, komi, new Set());
    
    // Check every stone on the board against surrounding territory
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color === 'black') {
          // Check if black stone is deep inside white territory or has almost no liberties & surrounded by white
          let whiteNeighbors = 0;
          let emptyNeighbors = 0;
          for (const nb of board.getNeighbors(x, y)) {
            if (grid[nb.y][nb.x] === 'white') whiteNeighbors++;
            else if (grid[nb.y][nb.x] === null) emptyNeighbors++;
          }
          const isInsideWhiteTerritory = baseMap.whiteTerritory.some(pt => Math.abs(pt.x - x) <= 1 && Math.abs(pt.y - y) <= 1);
          if ((whiteNeighbors >= 2 && emptyNeighbors <= 1 && isInsideWhiteTerritory) || (whiteNeighbors >= 3 && emptyNeighbors === 0)) {
            newDead.add(`${x},${y}`);
          }
        } else if (color === 'white') {
          let blackNeighbors = 0;
          let emptyNeighbors = 0;
          for (const nb of board.getNeighbors(x, y)) {
            if (grid[nb.y][nb.x] === 'black') blackNeighbors++;
            else if (grid[nb.y][nb.x] === null) emptyNeighbors++;
          }
          const isInsideBlackTerritory = baseMap.blackTerritory.some(pt => Math.abs(pt.x - x) <= 1 && Math.abs(pt.y - y) <= 1);
          if ((blackNeighbors >= 2 && emptyNeighbors <= 1 && isInsideBlackTerritory) || (blackNeighbors >= 3 && emptyNeighbors === 0)) {
            newDead.add(`${x},${y}`);
          }
        }
      }
    }

    setDeadStones(newDead);
  };

  const handleResetDeadStones = () => {
    soundManager.playStoneClick();
    setDeadStones(new Set());
  };

  const handleStoneClick = (x: number, y: number) => {
    if (grid[y][x] === null) return;
    soundManager.playStoneClick();
    setDeadStones(prev => {
      const next = new Set(prev);
      const key = `${x},${y}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Draw interactive board canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !territoryMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DIM = 420;
    canvas.width = DIM;
    canvas.height = DIM;

    const PADDING = 30;
    const CELL = (DIM - PADDING * 2) / (size - 1);
    const RADIUS = CELL * 0.45;

    // Background
    ctx.fillStyle = '#dbb075';
    ctx.fillRect(0, 0, DIM, DIM);

    // Grid lines
    ctx.strokeStyle = '#5a3d1e';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < size; i++) {
      const pos = PADDING + i * CELL;
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(DIM - PADDING, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, DIM - PADDING);
      ctx.stroke();
    }

    // Territory overlays (blue for black, white for white)
    territoryMap.blackTerritory.forEach(pt => {
      const cx = PADDING + pt.x * CELL;
      const cy = PADDING + pt.y * CELL;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(cx - CELL * 0.35, cy - CELL * 0.35, CELL * 0.7, CELL * 0.7);
    });

    territoryMap.whiteTerritory.forEach(pt => {
      const cx = PADDING + pt.x * CELL;
      const cy = PADDING + pt.y * CELL;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(cx - CELL * 0.35, cy - CELL * 0.35, CELL * 0.7, CELL * 0.7);
    });

    // Stones & Dead Stone X marks
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color) {
          const cx = PADDING + x * CELL;
          const cy = PADDING + y * CELL;
          const isDead = deadStones.has(`${x},${y}`);

          // Stone circle
          ctx.beginPath();
          ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = color === 'black' ? '#1e2025' : '#f8fafc';
          if (isDead) ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.strokeStyle = color === 'black' ? '#000' : '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Dead Stone X Mark
          if (isDead) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(cx - RADIUS * 0.6, cy - RADIUS * 0.6);
            ctx.lineTo(cx + RADIUS * 0.6, cy + RADIUS * 0.6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + RADIUS * 0.6, cy - RADIUS * 0.6);
            ctx.lineTo(cx - RADIUS * 0.6, cy + RADIUS * 0.6);
            ctx.stroke();
          }
        }
      }
    }
  }, [size, grid, territoryMap, deadStones]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 420 / rect.width;
    const xPos = (e.clientX - rect.left) * scale;
    const yPos = (e.clientY - rect.top) * scale;

    const PADDING = 30;
    const CELL = (420 - PADDING * 2) / (size - 1);

    const gx = Math.round((xPos - PADDING) / CELL);
    const gy = Math.round((yPos - PADDING) / CELL);

    if (gx >= 0 && gx < size && gy >= 0 && gy < size) {
      handleStoneClick(gx, gy);
    }
  };

  if (!territoryMap) return null;

  // Calculate extra captures due to dead stones
  let deadBlackCount = 0;
  let deadWhiteCount = 0;
  for (const key of deadStones) {
    const [dx, dy] = key.split(',').map(Number);
    if (grid[dy][dx] === 'black') deadBlackCount++;
    else if (grid[dy][dx] === 'white') deadWhiteCount++;
  }

  const blackTotal = territoryMap.blackScore;
  const whiteTotal = territoryMap.whiteScore;
  const diff = Math.abs(Math.round((blackTotal - whiteTotal) * 10) / 10);
  const isBlackWinner = blackTotal > whiteTotal;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid var(--accent-gold)',
        boxShadow: '0 0 40px rgba(245, 158, 11, 0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PieChart size={28} color="var(--accent-gold)" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fbbf24' }}>
                한게임 바둑 스타일 정밀 계가 및 사석 판독
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                판 위의 돌을 마우스로 클릭하여 죽은 돌(사석)로 지정하거나 해제할 수 있습니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Winner Banner */}
        <div style={{
          background: isBlackWinner ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(30, 41, 59, 0.6))' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(255, 255, 255, 0.15))',
          border: isBlackWinner ? '2px solid #38bdf8' : '2px solid #f59e0b',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Trophy size={36} color={isBlackWinner ? '#38bdf8' : '#fbbf24'} />
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>최종 계가 판정 결과</span>
              <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: isBlackWinner ? '#38bdf8' : '#fbbf24', margin: '2px 0 0 0' }}>
                {isBlackWinner ? `흑 ${diff}집 승!` : `백 ${diff}집 승!`}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleAutoDetectDeadStones}
              className="glass-button"
              style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b', fontWeight: 600, color: '#fbbf24' }}
            >
              <Sparkles size={16} /> AI 사석 자동 판독
            </button>
            <button
              onClick={handleResetDeadStones}
              className="glass-button"
              style={{ opacity: deadStones.size === 0 ? 0.4 : 1 }}
              disabled={deadStones.size === 0}
            >
              <RotateCcw size={16} /> 사석 초기화
            </button>
          </div>
        </div>

        {/* Content Grid (Board + Score Table) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8rem', alignItems: 'start' }}>
          {/* Interactive Board */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', border: '2px solid #5a3d1e' }}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', cursor: 'pointer', display: 'block' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={14} color="#f59e0b" /> 돌을 클릭하면 사석(빨간색 X 표시)으로 지정/해제됩니다.
            </span>
          </div>

          {/* Score Breakdown Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Black Card */}
            <div style={{
              background: 'rgba(30, 32, 37, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }}>⚫ 흑 (Black) 득점 내역</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{blackTotal} 집</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>판 위 확보 집 (Territory):</span>
                <strong style={{ color: '#fff' }}>{territoryMap.blackTerritory.length} 집</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>대국 중 따낸 백돌:</span>
                <strong style={{ color: '#fff' }}>+ {board.capturesBlack} 개</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: deadWhiteCount > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                <span>계가 중 지정된 백 사석:</span>
                <strong>+ {deadWhiteCount} 개</strong>
              </div>
            </div>

            {/* White Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>⚪ 백 (White) 득점 내역</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{whiteTotal} 집</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>판 위 확보 집 (Territory):</span>
                <strong style={{ color: '#fff' }}>{territoryMap.whiteTerritory.length} 집</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>대국 중 따낸 흑돌:</span>
                <strong style={{ color: '#fff' }}>+ {board.capturesWhite} 개</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: deadBlackCount > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                <span>계가 중 지정된 흑 사석:</span>
                <strong>+ {deadBlackCount} 개</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#f59e0b' }}>
                <span>덤 (Komi):</span>
                <strong>+ {komi} 집</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.92rem' }}
          >
            ↩️ 대국으로 돌아가기
          </button>
          <button
            onClick={() => {
              onRestartGame();
            }}
            className="glass-button"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderColor: '#10b981',
              color: '#fff',
              fontWeight: 700,
              padding: '0.6rem 1.5rem',
              fontSize: '0.95rem'
            }}
          >
            <CheckCircle2 size={18} /> 계가 확정 및 새 대국 시작
          </button>
        </div>
      </div>
    </div>
  );
};
