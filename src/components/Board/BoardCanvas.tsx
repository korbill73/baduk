import type { BoardSize, StoneColor, Point, AiRecommendation, TerritoryMap } from '../../types/go';
import { useRef, useEffect, useState, useCallback } from 'react';

interface BoardCanvasProps {
  size: BoardSize;
  grid: StoneColor[][];
  turn: 'black' | 'white';
  lastMove: Point | null;
  recommendations: AiRecommendation[];
  showHints: boolean;
  territoryMap: TerritoryMap | null;
  showTerritory: boolean;
  isThinking: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onPlaceStone: (x: number, y: number) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  size,
  grid,
  turn,
  lastMove,
  recommendations,
  showHints,
  territoryMap,
  showTerritory,
  isThinking,
  isExpanded = false,
  onToggleExpand,
  onPlaceStone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  // Constants for board sizing
  const BOARD_DIM = 620; // fixed canvas resolution
  const PADDING = 48; // generous padding so 19 lines & labels (A~T, 1~19) are 100% inside canvas
  const CELL_SIZE = (BOARD_DIM - PADDING * 2) / (size - 1);
  const STONE_RADIUS = CELL_SIZE * 0.46;

  // Star points (Hoshi) based on board size
  const getStarPoints = (boardSize: BoardSize): Point[] => {
    if (boardSize === 19) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
        { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }
      ];
    } else if (boardSize === 13) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 },
        { x: 6, y: 6 },
        { x: 3, y: 9 }, { x: 9, y: 9 }
      ];
    } else if (boardSize === 9) {
      return [
        { x: 2, y: 2 }, { x: 6, y: 2 },
        { x: 4, y: 4 },
        { x: 2, y: 6 }, { x: 6, y: 6 }
      ];
    }
    return [];
  };

  const gridToCanvas = (x: number, y: number) => {
    return {
      cx: PADDING + x * CELL_SIZE,
      cy: PADDING + y * CELL_SIZE
    };
  };

  const canvasToGrid = (clientX: number, clientY: number): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = BOARD_DIM / rect.width;
    const scaleY = BOARD_DIM / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const gridX = Math.round((canvasX - PADDING) / CELL_SIZE);
    const gridY = Math.round((canvasY - PADDING) / CELL_SIZE);

    if (gridX >= 0 && gridX < size && gridY >= 0 && gridY < size) {
      // Check distance from intersection center to allow accurate snapping
      const { cx, cy } = gridToCanvas(gridX, gridY);
      const dist = Math.hypot(canvasX - cx, canvasY - cy);
      if (dist <= CELL_SIZE * 0.52) {
        return { x: gridX, y: gridY };
      }
    }
    return null;
  };

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_DIM, BOARD_DIM);

    // 1. Luxury Japanese Kaya Wood (비자나무) base gradient
    const baseGrad = ctx.createLinearGradient(0, 0, BOARD_DIM, BOARD_DIM);
    baseGrad.addColorStop(0, '#e8be82');
    baseGrad.addColorStop(0.5, '#deaf6d');
    baseGrad.addColorStop(1, '#cd9954');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, BOARD_DIM, BOARD_DIM);

    // 1-1. Realistic Kaya wood grains across the board
    ctx.save();
    ctx.fillStyle = 'rgba(120, 68, 20, 0.045)';
    for (let i = 8; i < BOARD_DIM; i += 7) {
      const w = 1 + Math.sin(i * 0.1) * 1.5;
      ctx.fillRect(0, i, BOARD_DIM, w > 0 ? w : 1);
    }
    for (let i = 15; i < BOARD_DIM; i += 28) {
      ctx.fillStyle = 'rgba(90, 48, 10, 0.035)';
      ctx.fillRect(0, i, BOARD_DIM, 3 + Math.cos(i) * 2);
    }
    ctx.restore();

    // 1-2. 3D Beveled Wooden Frame Edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, BOARD_DIM - 3, BOARD_DIM - 3);
    ctx.strokeStyle = 'rgba(60, 30, 5, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, BOARD_DIM);
    ctx.lineTo(BOARD_DIM, BOARD_DIM);
    ctx.lineTo(BOARD_DIM, 0);
    ctx.stroke();

    // 2. Draw coordinate labels (A~T skipping I, 1~19)
    ctx.font = 'bold 13px Outfit, Inter, sans-serif';
    ctx.fillStyle = 'rgba(45, 26, 8, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
    for (let i = 0; i < size; i++) {
      const { cx } = gridToCanvas(i, 0);
      ctx.fillText(letters[i], cx, PADDING - 22);
      ctx.fillText(letters[i], cx, BOARD_DIM - PADDING + 22);

      const { cy: cyY } = gridToCanvas(0, i);
      const numLabel = `${size - i}`;
      ctx.fillText(numLabel, PADDING - 24, cyY);
      ctx.fillText(numLabel, BOARD_DIM - PADDING + 24, cyY);
    }

    // 3. Draw grid lines
    ctx.strokeStyle = '#321e0a';
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    for (let i = 0; i < size; i++) {
      const { cx: x0, cy: y0 } = gridToCanvas(i, 0);
      const { cx: x1, cy: y1 } = gridToCanvas(i, size - 1);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);

      const { cx: hx0, cy: hy0 } = gridToCanvas(0, i);
      const { cx: hx1, cy: hy1 } = gridToCanvas(size - 1, i);
      ctx.moveTo(hx0, hy0);
      ctx.lineTo(hx1, hy1);
    }
    ctx.stroke();

    // Outer border slightly thicker
    ctx.lineWidth = 2.6;
    ctx.strokeRect(PADDING, PADDING, BOARD_DIM - PADDING * 2, BOARD_DIM - PADDING * 2);

    // 4. Draw Star points (Hoshi) with subtle aura
    const starPoints = getStarPoints(size);
    for (const sp of starPoints) {
      const { cx, cy } = gridToCanvas(sp.x, sp.y);
      ctx.fillStyle = 'rgba(50, 30, 10, 0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Territory Overlay if enabled
    if (showTerritory && territoryMap) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const isBlackTerr = territoryMap.blackTerritory.some(p => p.x === x && p.y === y);
          const isWhiteTerr = territoryMap.whiteTerritory.some(p => p.x === x && p.y === y);
          if (isBlackTerr || isWhiteTerr) {
            const { cx, cy } = gridToCanvas(x, y);
            ctx.fillStyle = isBlackTerr ? 'rgba(10, 15, 25, 0.48)' : 'rgba(255, 255, 255, 0.65)';
            ctx.beginPath();
            ctx.fillRect(cx - CELL_SIZE * 0.45, cy - CELL_SIZE * 0.45, CELL_SIZE * 0.9, CELL_SIZE * 0.9);
            
            ctx.fillStyle = isBlackTerr ? '#000' : '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 6. Draw Stones (3D Slate & Clam Shell photographic texture)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color) {
          const { cx, cy } = gridToCanvas(x, y);

          // 1. Double-layered 3D shadow (soft diffuse ambient + sharp contact shadow)
          ctx.beginPath();
          ctx.arc(cx + 4.0, cy + 5.0, STONE_RADIUS * 1.02, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx + 2.2, cy + 3.0, STONE_RADIUS * 0.98, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fill();

          // 2. High-definition 3D Stone body
          ctx.beginPath();
          ctx.arc(cx, cy, STONE_RADIUS, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            cx - STONE_RADIUS * 0.38,
            cy - STONE_RADIUS * 0.38,
            STONE_RADIUS * 0.06,
            cx + STONE_RADIUS * 0.1,
            cy + STONE_RADIUS * 0.1,
            STONE_RADIUS * 1.05
          );

          if (color === 'black') {
            // Japanese Slate (최고급 오석 특유의 묵직하고 깊은 나전 광택)
            grad.addColorStop(0, '#627288');
            grad.addColorStop(0.22, '#2c3644');
            grad.addColorStop(0.65, '#12161f');
            grad.addColorStop(0.92, '#07090d');
            grad.addColorStop(1, '#020305');
          } else {
            // Japanese Clam Shell (최고급 조개바둑알 백합패 입체 질감)
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.38, '#f7f9fc');
            grad.addColorStop(0.78, '#e2e8f0');
            grad.addColorStop(0.95, '#c5d1e0');
            grad.addColorStop(1, '#a6b5c7');
          }

          ctx.fillStyle = grad;
          ctx.fill();

          // 3. Clam shell natural curvature stripes for White stone (천연 조개바둑알 결)
          if (color === 'white') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, STONE_RADIUS * 0.95, 0, Math.PI * 2);
            ctx.clip();
            ctx.strokeStyle = 'rgba(175, 190, 210, 0.24)';
            ctx.lineWidth = 1.1;
            for (let s = -STONE_RADIUS; s < STONE_RADIUS; s += 4.2) {
              ctx.beginPath();
              ctx.arc(cx - STONE_RADIUS * 0.42 + s, cy + STONE_RADIUS * 0.65, STONE_RADIUS * 1.15, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.restore();
          }

          // 4. Ultra-crisp Specular Reflection dot at top-left
          ctx.beginPath();
          ctx.arc(cx - STONE_RADIUS * 0.36, cy - STONE_RADIUS * 0.36, STONE_RADIUS * 0.25, 0, Math.PI * 2);
          const specGrad = ctx.createRadialGradient(
            cx - STONE_RADIUS * 0.39,
            cy - STONE_RADIUS * 0.39,
            1,
            cx - STONE_RADIUS * 0.36,
            cy - STONE_RADIUS * 0.36,
            STONE_RADIUS * 0.25
          );
          if (color === 'black') {
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          } else {
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }
          ctx.fillStyle = specGrad;
          ctx.fill();

          // 5. Bottom-right ambient rim light reflection (바둑판 나무 반사광)
          ctx.beginPath();
          ctx.arc(cx + STONE_RADIUS * 0.42, cy + STONE_RADIUS * 0.42, STONE_RADIUS * 0.38, 0, Math.PI * 2);
          const rimGrad = ctx.createRadialGradient(
            cx + STONE_RADIUS * 0.5,
            cy + STONE_RADIUS * 0.5,
            STONE_RADIUS * 0.05,
            cx + STONE_RADIUS * 0.42,
            cy + STONE_RADIUS * 0.42,
            STONE_RADIUS * 0.38
          );
          if (color === 'black') {
            rimGrad.addColorStop(0, 'rgba(180, 140, 90, 0.12)');
            rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }
          ctx.fillStyle = rimGrad;
          ctx.fill();

          // Last move highlight ring
          if (lastMove && lastMove.x === x && lastMove.y === y) {
            ctx.strokeStyle = color === 'black' ? '#38bdf8' : '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, STONE_RADIUS * 0.55, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    }

    // 7. Draw AI Recommendations (Hints)
    if (showHints && recommendations.length > 0) {
      recommendations.forEach((rec) => {
        const { cx, cy } = gridToCanvas(rec.point.x, rec.point.y);
        const colorRing = rec.rank === 1 ? '#f59e0b' : rec.rank === 2 ? '#38bdf8' : '#10b981';

        // Outer pulsing circle
        ctx.strokeStyle = colorRing;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, STONE_RADIUS * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colorRing;
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`${rec.rank}`, cx, cy);
      });
    }

    // 8. Draw Hover preview stone
    if (hoverPoint && grid[hoverPoint.y][hoverPoint.x] === null && !isThinking) {
      const { cx, cy } = gridToCanvas(hoverPoint.x, hoverPoint.y);
      ctx.beginPath();
      ctx.arc(cx, cy, STONE_RADIUS * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = turn === 'black' ? 'rgba(30, 32, 37, 0.45)' : 'rgba(248, 250, 252, 0.55)';
      ctx.fill();
    }
  }, [size, grid, turn, lastMove, recommendations, showHints, territoryMap, showTerritory, hoverPoint, isThinking]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isThinking) return;
    const pt = canvasToGrid(e.clientX, e.clientY);
    setHoverPoint(pt);
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isThinking) return;
    const pt = canvasToGrid(e.clientX, e.clientY);
    if (pt && grid[pt.y][pt.x] === null) {
      onPlaceStone(pt.x, pt.y);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {onToggleExpand && (
        <div className="board-expand-bar" style={{
          maxWidth: isExpanded ? 'min(940px, calc(100vh - 28px))' : '640px',
        }}>
          <button
            onClick={onToggleExpand}
            className="expand-toggle-btn"
            title="PC 화면 바둑판 크기 전환"
          >
            <span>{isExpanded ? '↙ 기본 화면으로 축소' : '⛶ 바둑판 크게 보기'}</span>
          </button>
        </div>
      )}

      <div className="board-frame" style={{
        width: '100%',
        maxWidth: isExpanded ? 'min(940px, calc(100vh - 28px))' : '640px',
        maxHeight: isExpanded ? 'calc(100vh - 28px)' : 'none',
        aspectRatio: '1/1',
        margin: '0 auto',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div className="board-inner" style={{ width: '100%', height: '100%', display: 'flex' }}>
          <canvas
            ref={canvasRef}
            width={BOARD_DIM}
            height={BOARD_DIM}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
              width: '100%',
              height: '100%',
              cursor: isThinking ? 'wait' : 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
};
