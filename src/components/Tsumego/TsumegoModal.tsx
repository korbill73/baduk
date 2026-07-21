import React, { useState } from 'react';
import type { TsumegoPuzzle, StoneColor, Point } from '../../types/go';
import { TSUMEGO_PUZZLES } from '../../data/tsumegoPuzzles';
import { BoardCanvas } from '../Board/BoardCanvas';
import { HelpCircle, CheckCircle2, AlertCircle, RotateCcw, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../sound/SoundManager';

interface TsumegoModalProps {
  onClose: () => void;
}

export const TsumegoModal: React.FC<TsumegoModalProps> = ({ onClose }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<TsumegoPuzzle>(TSUMEGO_PUZZLES[0]);
  const [grid, setGrid] = useState<StoneColor[][]>(() => {
    const g: StoneColor[][] = Array.from({ length: selectedPuzzle.boardSize }, () => Array(selectedPuzzle.boardSize).fill(null));
    selectedPuzzle.initialStones.forEach(st => {
      g[st.y][st.x] = st.color;
    });
    return g;
  });
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [comment, setComment] = useState<string>(selectedPuzzle.description);

  const resetPuzzle = (puzzle: TsumegoPuzzle = selectedPuzzle) => {
    const g: StoneColor[][] = Array.from({ length: puzzle.boardSize }, () => Array(puzzle.boardSize).fill(null));
    puzzle.initialStones.forEach(st => {
      g[st.y][st.x] = st.color;
    });
    setGrid(g);
    setLastMove(null);
    setStatus('playing');
    setComment(puzzle.description);
  };

  const handleSelectPuzzle = (puzzle: TsumegoPuzzle) => {
    setSelectedPuzzle(puzzle);
    resetPuzzle(puzzle);
  };

  const handlePlaceStone = (x: number, y: number) => {
    if (status !== 'playing') return;

    soundManager.playStoneClick();
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = selectedPuzzle.playerColor;
    setGrid(newGrid);
    setLastMove({ x, y });

    // Check if move matches solution tree
    const matchingNode = selectedPuzzle.solutionTree.find(
      node => node.point.x === x && node.point.y === y
    );

    if (matchingNode && matchingNode.isCorrect) {
      setStatus('solved');
      setComment(matchingNode.comment);
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      setStatus('failed');
      setComment(selectedPuzzle.failureComment);
      soundManager.playError();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '90vh',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '1.5rem',
        padding: '1.8rem',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar: Puzzle List & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle color="var(--accent-gold)" /> 사활 / 묘수 도장
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            6급 탈출부터 9단 신계 묘수까지 단계별 퍼즐을 풀며 수읽기(`수읽기`) 실력을 연마하세요!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {TSUMEGO_PUZZLES.map((pz) => {
              const isSelected = pz.id === selectedPuzzle.id;
              return (
                <div
                  key={pz.id}
                  onClick={() => handleSelectPuzzle(pz)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899' }}>{pz.level}</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{pz.category}</span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#fff' }}>{pz.title}</h4>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => resetPuzzle()} className="glass-button" style={{ flex: 1, justifyContent: 'center' }}>
              <RotateCcw size={16} /> 다시 도전
            </button>
            <button onClick={onClose} className="glass-button primary" style={{ flex: 1, justifyContent: 'center' }}>
              도장 닫기
            </button>
          </div>
        </div>

        {/* Right Area: Puzzle Board & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.2rem' }}>
          <div style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: status === 'solved' ? 'rgba(16, 185, 129, 0.15)' : status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${status === 'solved' ? '#10b981' : status === 'failed' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            {status === 'solved' && <CheckCircle2 size={24} color="#10b981" />}
            {status === 'failed' && <AlertCircle size={24} color="#ef4444" />}
            {status === 'playing' && <ShieldAlert size={24} color="#38bdf8" />}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: status === 'solved' ? '#34d399' : status === 'failed' ? '#f87171' : '#38bdf8' }}>
                {status === 'solved' ? '정답입니다! 완벽한 수읽기!' : status === 'failed' ? '오답입니다 (다시 도전해보세요)' : selectedPuzzle.title}
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {comment}
              </p>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '480px' }}>
            <BoardCanvas
              size={selectedPuzzle.boardSize}
              grid={grid}
              turn={selectedPuzzle.playerColor}
              lastMove={lastMove}
              recommendations={[]}
              showHints={false}
              territoryMap={null}
              showTerritory={false}
              isThinking={false}
              onPlaceStone={handlePlaceStone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
