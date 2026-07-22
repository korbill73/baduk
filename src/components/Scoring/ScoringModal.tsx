import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoBoard } from '../../core/GoBoard';
import { ScoringEngine } from '../../core/Scoring';
import type { TerritoryMap, StoneColor, Point } from '../../types/go';
import { Trophy, RotateCcw, Sparkles, X, PieChart, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface ScoringModalProps {
  board: GoBoard;
  komi: number;
  onClose: () => void;
  onConfirmScoring: (winner: 'black' | 'white' | 'draw', scoreDiff: number) => void;
}

export const ScoringModal: React.FC<ScoringModalProps> = ({
  board,
  komi,
  onClose,
  onConfirmScoring,
}) => {
  const size = board.size;
  // Deep copy grid snapshot to prevent reference mutation issues
  const [gridSnapshot] = useState<StoneColor[][]>(() => {
    return board.grid.map(row => [...row]);
  });

  const [deadStones, setDeadStones] = useState<Set<string>>(new Set());
  const [territoryMap, setTerritoryMap] = useState<TerritoryMap | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Automatically detect dead stones when modal opens
  const autoDetectDeadStones = useCallback(() => {
    const newDead = new Set<string>();
    const baseMap = ScoringEngine.estimateTerritoryAndScore(board, komi, new Set());
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = gridSnapshot[y][x];
        if (!color) continue;

        let enemyNeighbors = 0;
        let emptyNeighbors = 0;
        for (const nb of board.getNeighbors(x, y)) {
          const nbColor = gridSnapshot[nb.y][nb.x];
          if (nbColor && nbColor !== color) enemyNeighbors++;
          else if (nbColor === null) emptyNeighbors++;
        }

        const isInsideEnemyTerritory = color === 'black'
          ? baseMap.whiteTerritory.some(pt => Math.abs(pt.x - x) <= 1 && Math.abs(pt.y - y) <= 1)
          : baseMap.blackTerritory.some(pt => Math.abs(pt.x - x) <= 1 && Math.abs(pt.y - y) <= 1);

        if ((enemyNeighbors >= 2 && emptyNeighbors <= 1 && isInsideEnemyTerritory) || (enemyNeighbors >= 3 && emptyNeighbors === 0)) {
          newDead.add(`${x},${y}`);
        }
      }
    }
    setDeadStones(newDead);
  }, [board, komi, gridSnapshot, size]);

  // Run auto detection on initial mount
  useEffect(() => {
    autoDetectDeadStones();
  }, [autoDetectDeadStones]);

  // Update territory calculation whenever deadStones changes
  useEffect(() => {
    const map = ScoringEngine.estimateTerritoryAndScore(board, komi, deadStones);
    setTerritoryMap(map);
  }, [board, komi, deadStones]);

  const handleStoneClick = (x: number, y: number) => {
    if (gridSnapshot[y][x] === null) return;
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

  const handleResetDeadStones = () => {
    soundManager.playStoneClick();
    setDeadStones(new Set());
  };

  // Draw interactive board canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !territoryMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BOARD_DIM = 500;
    canvas.width = BOARD_DIM;
    canvas.height = BOARD_DIM;

    const PADDING = 36;
    const CELL_SIZE = (BOARD_DIM - PADDING * 2) / (size - 1);
    const STONE_RADIUS = CELL_SIZE * 0.45;

    ctx.clearRect(0, 0, BOARD_DIM, BOARD_DIM);

    // 1. Kaya Wood background
    const baseGrad = ctx.createLinearGradient(0, 0, BOARD_DIM, BOARD_DIM);
    baseGrad.addColorStop(0, '#e8be82');
    baseGrad.addColorStop(0.5, '#deaf6d');
    baseGrad.addColorStop(1, '#cd9954');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, BOARD_DIM, BOARD_DIM);

    // Grid lines
    ctx.strokeStyle = 'rgba(60, 30, 5, 0.75)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < size; i++) {
      const pos = PADDING + i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(BOARD_DIM - PADDING, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, BOARD_DIM - PADDING);
      ctx.stroke();
    }

    // Hoshi Star Points
    const getStarPoints = (s: number): Point[] => {
      if (s === 19) return [{ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 }, { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 }, { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }];
      if (s === 13) return [{ x: 3, y: 3 }, { x: 9, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 9 }, { x: 9, y: 9 }];
      if (s === 9) return [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 4, y: 4 }, { x: 2, y: 6 }, { x: 6, y: 6 }];
      return [];
    };

    ctx.fillStyle = 'rgba(60, 30, 5, 0.9)';
    getStarPoints(size).forEach(pt => {
      const cx = PADDING + pt.x * CELL_SIZE;
      const cy = PADDING + pt.y * CELL_SIZE;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Territory Overlays (Blue for Black territory, Bright Yellow/White for White territory)
    territoryMap.blackTerritory.forEach(pt => {
      const cx = PADDING + pt.x * CELL_SIZE;
      const cy = PADDING + pt.y * CELL_SIZE;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.fillRect(cx - CELL_SIZE * 0.28, cy - CELL_SIZE * 0.28, CELL_SIZE * 0.56, CELL_SIZE * 0.56);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - CELL_SIZE * 0.28, cy - CELL_SIZE * 0.28, CELL_SIZE * 0.56, CELL_SIZE * 0.56);
    });

    territoryMap.whiteTerritory.forEach(pt => {
      const cx = PADDING + pt.x * CELL_SIZE;
      const cy = PADDING + pt.y * CELL_SIZE;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.fillRect(cx - CELL_SIZE * 0.28, cy - CELL_SIZE * 0.28, CELL_SIZE * 0.56, CELL_SIZE * 0.56);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - CELL_SIZE * 0.28, cy - CELL_SIZE * 0.28, CELL_SIZE * 0.56, CELL_SIZE * 0.56);
    });

    // 3. Stones and Dead Stone Marks
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = gridSnapshot[y][x];
        if (color) {
          const cx = PADDING + x * CELL_SIZE;
          const cy = PADDING + y * CELL_SIZE;
          const isDead = deadStones.has(`${x},${y}`);

          // Shadow
          ctx.beginPath();
          ctx.arc(cx + 2, cy + 2.5, STONE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fill();

          // Stone body
          ctx.beginPath();
          ctx.arc(cx, cy, STONE_RADIUS, 0, Math.PI * 2);
          const stoneGrad = ctx.createRadialGradient(cx - STONE_RADIUS * 0.3, cy - STONE_RADIUS * 0.3, STONE_RADIUS * 0.1, cx, cy, STONE_RADIUS);
          if (color === 'black') {
            stoneGrad.addColorStop(0, '#555');
            stoneGrad.addColorStop(0.7, '#1a1a1a');
            stoneGrad.addColorStop(1, '#000');
          } else {
            stoneGrad.addColorStop(0, '#ffffff');
            stoneGrad.addColorStop(0.85, '#e2e8f0');
            stoneGrad.addColorStop(1, '#cbd5e1');
          }
          ctx.fillStyle = stoneGrad;
          if (isDead) ctx.globalAlpha = 0.35;
          ctx.fill();

          ctx.strokeStyle = color === 'black' ? '#000' : '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Dead Stone X mark
          if (isDead) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(cx - STONE_RADIUS * 0.55, cy - STONE_RADIUS * 0.55);
            ctx.lineTo(cx + STONE_RADIUS * 0.55, cy + STONE_RADIUS * 0.55);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + STONE_RADIUS * 0.55, cy - STONE_RADIUS * 0.55);
            ctx.lineTo(cx - STONE_RADIUS * 0.55, cy + STONE_RADIUS * 0.55);
            ctx.stroke();
          }
        }
      }
    }
  }, [size, gridSnapshot, territoryMap, deadStones]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 500 / rect.width;
    const xPos = (e.clientX - rect.left) * scale;
    const yPos = (e.clientY - rect.top) * scale;

    const PADDING = 36;
    const CELL_SIZE = (500 - PADDING * 2) / (size - 1);

    const gx = Math.round((xPos - PADDING) / CELL_SIZE);
    const gy = Math.round((yPos - PADDING) / CELL_SIZE);

    if (gx >= 0 && gx < size && gy >= 0 && gy < size) {
      handleStoneClick(gx, gy);
    }
  };

  if (!territoryMap) return null;

  // Calculate dead stone counts
  let deadBlackCount = 0;
  let deadWhiteCount = 0;
  for (const key of deadStones) {
    const [dx, dy] = key.split(',').map(Number);
    if (gridSnapshot[dy]?.[dx] === 'black') deadBlackCount++;
    else if (gridSnapshot[dy]?.[dx] === 'white') deadWhiteCount++;
  }

  const blackTotal = territoryMap.blackScore;
  const whiteTotal = territoryMap.whiteScore;
  const diff = Math.abs(Math.round((blackTotal - whiteTotal) * 10) / 10);
  const isBlackWinner = blackTotal > whiteTotal;
  const winner: 'black' | 'white' | 'draw' = blackTotal === whiteTotal ? 'draw' : isBlackWinner ? 'black' : 'white';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(4, 9, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.2rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '960px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        border: '1px solid #fbbf24',
        boxShadow: '0 0 50px rgba(245, 158, 11, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <PieChart size={26} color="#fbbf24" />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                한게임 바둑 스타일 정밀 계가 및 사석 판독
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                판 위의 돌을 마우스로 클릭하여 죽은 돌(사석)을 자유롭게 지정하거나 해제할 수 있습니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Winner Banner */}
        <div style={{
          background: isBlackWinner
            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.9))'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.25))',
          border: `1px solid ${isBlackWinner ? '#38bdf8' : '#fbbf24'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Trophy size={36} color={isBlackWinner ? '#38bdf8' : '#fbbf24'} />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>최종 계가 판정 결과</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isBlackWinner ? '#38bdf8' : '#fbbf24' }}>
                {winner === 'draw' ? '무승부 (빅)' : `${winner === 'black' ? '흑' : '백'} ${diff}집 승!`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={autoDetectDeadStones}
              className="glass-button"
              style={{ background: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, padding: '0.45rem 0.85rem' }}
            >
              <Sparkles size={15} /> AI 사석 자동 판독
            </button>
            <button
              onClick={handleResetDeadStones}
              className="glass-button"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <RotateCcw size={15} /> 사석 초기화
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 300px', gap: '1.2rem', alignItems: 'center' }}>
          {/* Board Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '100%', maxWidth: '440px', aspectRatio: '1/1', background: '#dbb075', borderRadius: '8px', padding: '6px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: '100%', cursor: 'pointer', borderRadius: '4px' }}
              />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
              💡 돌을 클릭하면 사석(빨간색 ✕ 표시)으로 지정 / 해제됩니다.
            </div>
          </div>

          {/* Detailed Score Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Black score card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#000', border: '1px solid #38bdf8' }} /> 흑 (Black) 득점
                </span>
                <span style={{ fontWeight: 900, color: '#38bdf8', fontSize: '1.2rem' }}>{blackTotal} 집</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>판 위 확보 집 (Territory):</span>
                  <strong>{territoryMap.blackTerritory.length} 집</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>대국 중 따낸 백돌:</span>
                  <strong>+{board.capturesBlack} 개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>계가 중 지정된 백 사석:</span>
                  <strong>+{deadWhiteCount} 개</strong>
                </div>
              </div>
            </div>

            {/* White score card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', border: '1px solid #fbbf24' }} /> 백 (White) 득점
                </span>
                <span style={{ fontWeight: 900, color: '#fbbf24', fontSize: '1.2rem' }}>{whiteTotal} 집</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>판 위 확보 집 (Territory):</span>
                  <strong>{territoryMap.whiteTerritory.length} 집</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>대국 중 따낸 흑돌:</span>
                  <strong>+{board.capturesWhite} 개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>계가 중 지정된 흑 사석:</span>
                  <strong>+{deadBlackCount} 개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span>덤 (Komi):</span>
                  <strong>+{komi} 집</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>
            ↩ 대국으로 돌아가기
          </button>
          <button
            onClick={() => {
              onConfirmScoring(winner, diff);
            }}
            className="glass-button primary"
            style={{ padding: '0.55rem 1.3rem', fontSize: '0.88rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#34d399' }}
          >
            <ShieldCheck size={18} /> 계가 확정 및 새 대국 시작
          </button>
        </div>
      </div>
    </div>
  );
};
