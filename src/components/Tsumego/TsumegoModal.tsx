import React, { useState } from 'react';
import type { TsumegoPuzzle, StoneColor, Point } from '../../types/go';
import { TSUMEGO_PUZZLES } from '../../data/tsumegoPuzzles';
import { BoardCanvas } from '../Board/BoardCanvas';
import { HelpCircle, CheckCircle2, AlertCircle, RotateCcw, X, Sparkles } from 'lucide-react';
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

    // Check solution matching
    const matchingNode = selectedPuzzle.solutionTree.find(
      node => node.point.x === x && node.point.y === y
    );

    if (matchingNode && matchingNode.isCorrect) {
      setStatus('solved');
      setComment(matchingNode.comment);
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
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
      backgroundColor: 'rgba(4, 9, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '92vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr',
        gap: '1.2rem',
        padding: '1.4rem',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
      }}>
        {/* Left Section: Puzzle Bank */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', paddingRight: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle color="#fbbf24" size={22} /> 사활 / 묘수 도장
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            실전 사활 문제를 풀며 수읽기 감각을 기르세요! 흑선(흑이 먼저 둠)으로 정답 급소를 찾아 착수하세요.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.4rem' }}>
            {TSUMEGO_PUZZLES.map((pz) => {
              const isSelected = pz.id === selectedPuzzle.id;
              return (
                <div
                  key={pz.id}
                  onClick={() => handleSelectPuzzle(pz)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.9))' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 15px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fbbf24' }}>{pz.level}</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>{pz.category}</span>
                  </div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc', lineHeight: 1.3 }}>{pz.title}</h4>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => resetPuzzle()} className="glass-button" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}>
              <RotateCcw size={15} /> 다시 도전
            </button>
            <button onClick={onClose} className="glass-button primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}>
              <X size={15} /> 도장 닫기
            </button>
          </div>
        </div>

        {/* Right Section: Tsumego Board Canvas & Live Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', overflowY: 'auto' }}>
          {/* Problem Header Info */}
          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                {selectedPuzzle.title}
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.18)', padding: '2px 8px', borderRadius: '8px' }}>
                ⚫ 흑선 (흑차례)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.35, margin: 0 }}>
              {selectedPuzzle.description}
            </p>
          </div>

          {/* Board Area */}
          <div style={{ width: '100%', maxWidth: '440px', aspectRatio: '1/1' }}>
            <BoardCanvas
              size={selectedPuzzle.boardSize}
              grid={grid}
              turn="black"
              lastMove={lastMove}
              recommendations={[]}
              showHints={false}
              territoryMap={null}
              showTerritory={false}
              isThinking={false}
              onPlaceStone={handlePlaceStone}
            />
          </div>

          {/* Feedback & Result Message */}
          <div style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: status === 'solved'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.3))'
              : status === 'failed'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.3))'
              : 'rgba(15, 23, 42, 0.75)',
            border: `1px solid ${status === 'solved' ? '#10b981' : status === 'failed' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {status === 'solved' && <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0 }} />}
            {status === 'failed' && <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />}
            {status === 'playing' && <Sparkles size={24} color="#38bdf8" style={{ flexShrink: 0 }} />}
            
            <div style={{ fontSize: '0.84rem', lineHeight: 1.35, flex: 1 }}>
              {status === 'solved' && (
                <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '2px', fontSize: '0.92rem' }}>
                  🎉 축하합니다! 완벽하게 사활 정답을 맞추셨습니다!
                </div>
              )}
              {status === 'failed' && (
                <div style={{ fontWeight: 800, color: '#fca5a5', marginBottom: '2px', fontSize: '0.92rem' }}>
                  ❌ 아쉽습니다! 급소를 놓쳐 실패했습니다.
                </div>
              )}
              {status === 'playing' && (
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  💡 힌트: {selectedPuzzle.hint}
                </div>
              )}
              {status !== 'playing' && (
                <div style={{ color: '#f8fafc', fontWeight: 500 }}>
                  {comment}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
