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
  onPlaceStone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  // Constants for board sizing
  const BOARD_DIM = 620; // fixed canvas resolution
  const PADDING = 44;
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

    // 1. Draw wood texture base & border line
    ctx.fillStyle = '#d29d5b';
    ctx.fillRect(0, 0, BOARD_DIM, BOARD_DIM);

    // Subtle grain effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let i = 0; i < BOARD_DIM; i += 12) {
      ctx.fillRect(0, i, BOARD_DIM, 2);
    }

    // 2. Draw coordinate labels (A~T skipping I, 1~19)
    ctx.font = 'bold 13px Outfit, Inter, sans-serif';
    ctx.fillStyle = 'rgba(43, 27, 8, 0.8)';
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
    ctx.strokeStyle = '#2b1b08';
    ctx.lineWidth = 1.3;
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
    ctx.lineWidth = 2.5;
    ctx.strokeRect(PADDING, PADDING, BOARD_DIM - PADDING * 2, BOARD_DIM - PADDING * 2);

    // 4. Draw Star points (Hoshi)
    ctx.fillStyle = '#2b1b08';
    const starPoints = getStarPoints(size);
    for (const sp of starPoints) {
      const { cx, cy } = gridToCanvas(sp.x, sp.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
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
            ctx.fillStyle = isBlackTerr ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.58)';
            ctx.beginPath();
            ctx.fillRect(cx - CELL_SIZE * 0.45, cy - CELL_SIZE * 0.45, CELL_SIZE * 0.9, CELL_SIZE * 0.9);
            
            // Inner small dot
            ctx.fillStyle = isBlackTerr ? '#000' : '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 6. Draw Stones with 3D gradient and shadows
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const color = grid[y][x];
        if (color) {
          const { cx, cy } = gridToCanvas(x, y);

          // Drop shadow
          ctx.beginPath();
          ctx.arc(cx + 2.5, cy + 3.5, STONE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fill();

          // Stone body
          ctx.beginPath();
          ctx.arc(cx, cy, STONE_RADIUS, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            cx - STONE_RADIUS * 0.35,
            cy - STONE_RADIUS * 0.35,
            STONE_RADIUS * 0.1,
            cx,
            cy,
            STONE_RADIUS
          );

          if (color === 'black') {
            grad.addColorStop(0, '#525b68');
            grad.addColorStop(0.3, '#242830');
            grad.addColorStop(1, '#0e1013');
          } else {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.6, '#f1f5f9');
            grad.addColorStop(1, '#cbd5e1');
          }

          ctx.fillStyle = grad;
          ctx.fill();

          // Last move highlight ring
          if (lastMove && lastMove.x === x && lastMove.y === y) {
            ctx.strokeStyle = color === 'black' ? '#38bdf8' : '#ef4444';
            ctx.lineWidth = 2.8;
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
    <div className="board-frame" style={{ width: '100%', maxWidth: '640px', aspectRatio: '1/1', margin: '0 auto' }}>
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
  );
};
