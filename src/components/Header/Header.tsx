import React, { useState, useEffect } from 'react';
import type { GameMode, BoardSize, RankInfo } from '../../types/go';
import { Volume2, VolumeX, Award, BookOpen, Play, RotateCcw, HelpCircle, Users, Globe, User, Maximize2, Minimize2 } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';
import { KataGoBridge } from '../../ai/KataGoBridge';
import { PwaInstallPrompt } from '../PwaInstallPrompt';

interface HeaderProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  boardSize: BoardSize;
  setBoardSize: (size: BoardSize) => void;
  aiRank: RankInfo;
  onOpenRankSelector: () => void;
  onOpenAiEngineModal: () => void;
  onOpenOnlineModal: () => void;
  onOpenProfileModal: () => void;
  myNickname: string;
  myRankTitle: string;
  onNewGame: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isBoardExpanded?: boolean;
  onToggleBoardExpand?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  boardSize,
  setBoardSize,
  aiRank,
  onOpenRankSelector,
  onOpenAiEngineModal,
  onOpenOnlineModal,
  onOpenProfileModal,
  myNickname,
  myRankTitle,
  onNewGame,
  soundEnabled,
  setSoundEnabled,
  isBoardExpanded = false,
  onToggleBoardExpand,
}) => {
  const [isKataGoConnected, setIsKataGoConnected] = useState(KataGoBridge.getConfig().enabled);

  useEffect(() => {
    return KataGoBridge.onStatusChange((enabled) => {
      setIsKataGoConnected(enabled);
    });
  }, []);
  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <header className="glass-panel" style={{
      padding: '0.8rem 1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e2025 50%, #f8fafc 50%)',
          border: '2px solid #38bdf8',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-45deg)'
        }} />
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Baduk AI Master Class
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            6급부터 9단까지 함께 성장하는 맞춤 AI 바둑 도장
          </p>
        </div>
      </div>

      {/* Mode navigation */}
      <div className="header-nav-group" style={{ background: 'var(--bg-glass)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
        <button
          onClick={() => setMode('play')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === 'play' ? 'var(--accent-blue)' : 'transparent',
            color: '#fff',
            fontWeight: mode === 'play' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <Play size={16} /> AI 대국 (vs AI)
        </button>
        <button
          onClick={() => setMode('pvp')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === 'pvp' ? '#a855f7' : 'transparent',
            color: '#fff',
            fontWeight: mode === 'pvp' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <Users size={16} /> 1:1 대국 (로컬)
        </button>
        <button
          onClick={() => {
            setMode('online');
            onOpenOnlineModal();
          }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === 'online' ? 'linear-gradient(135deg, #38bdf8, #0284c7)' : 'transparent',
            color: '#fff',
            fontWeight: mode === 'online' ? 700 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
            boxShadow: mode === 'online' ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
          }}
        >
          <Globe size={16} /> 온라인 1:1 (P2P 방만들기)
        </button>
        <button
          onClick={() => setMode('review')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === 'review' ? 'var(--accent-emerald)' : 'transparent',
            color: '#fff',
            fontWeight: mode === 'review' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={16} /> AI 복기 (Review)
        </button>
        <button
          onClick={() => setMode('tsumego')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: mode === 'tsumego' ? 'var(--accent-gold)' : 'transparent',
            color: '#fff',
            fontWeight: mode === 'tsumego' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <HelpCircle size={16} /> 사활 문제 (Tsumego)
        </button>
      </div>

      {/* Controls */}
      <div className="header-actions-group">
        <PwaInstallPrompt />

        {/* User Profile Button */}
        <button
          onClick={onOpenProfileModal}
          className="glass-button"
          style={{ borderColor: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', gap: '0.4rem', padding: '0.5rem 0.9rem' }}
          title="내 기사 ID 및 대국 전적 조회"
        >
          <User size={16} color="#38bdf8" />
          <span style={{ fontWeight: 700, color: '#fff' }}>{myNickname}</span>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(245,158,11,0.2)', padding: '1px 6px', borderRadius: '8px' }}>{myRankTitle}</span>
        </button>

        {mode === 'play' && (
          <>
            <select
              value={boardSize}
              onChange={(e) => setBoardSize(Number(e.target.value) as BoardSize)}
              style={{
                background: 'var(--bg-glass)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.8rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <option value={19} style={{ background: '#1e293b' }}>19x19</option>
              <option value={13} style={{ background: '#1e293b' }}>13x13</option>
              <option value={9} style={{ background: '#1e293b' }}>9x9</option>
            </select>

            <button
              onClick={onOpenRankSelector}
              className="glass-button"
              style={{ borderColor: aiRank.badgeColor }}
            >
              <Award size={18} style={{ color: aiRank.badgeColor }} />
              <span>AI 난이도: <strong style={{ color: aiRank.badgeColor }}>{aiRank.name}</strong></span>
            </button>

            <button
              onClick={onOpenAiEngineModal}
              className="glass-button"
              style={{
                borderColor: isKataGoConnected ? '#22c55e' : '#38bdf8',
                background: isKataGoConnected ? 'rgba(34, 197, 94, 0.22)' : 'rgba(56, 189, 248, 0.15)'
              }}
              title="외부 전문 바둑 AI 엔진 연동 센터"
            >
              <span style={{ fontSize: '1rem' }}>{isKataGoConnected ? '🟢' : '🤖'}</span>
              <span style={{ fontWeight: 600, color: isKataGoConnected ? '#22c55e' : '#38bdf8' }}>
                {isKataGoConnected ? 'AI 자동 연동됨 (최고수)' : '전문 바둑 AI 연동'}
              </span>
            </button>
          </>
        )}

        {mode === 'online' && (
          <button
            onClick={onOpenOnlineModal}
            className="glass-button"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', fontWeight: 700, borderColor: '#38bdf8' }}
          >
            <Globe size={16} /> 방 만들기 / 초대 코드 접속
          </button>
        )}

        {onToggleBoardExpand && (
          <button
            onClick={onToggleBoardExpand}
            className="glass-button"
            style={{
              borderColor: isBoardExpanded ? '#fbbf24' : 'rgba(56, 189, 248, 0.35)',
              background: isBoardExpanded ? 'rgba(245, 158, 11, 0.22)' : 'var(--bg-glass)',
              color: isBoardExpanded ? '#fbbf24' : '#fff',
              fontWeight: 600,
              gap: '0.4rem',
              padding: '0.5rem 0.9rem'
            }}
            title={isBoardExpanded ? '기본 바둑판 크기로 복귀' : '한게임 스타일 바둑판 크게 보기 모드'}
          >
            {isBoardExpanded ? <Minimize2 size={16} color="#fbbf24" /> : <Maximize2 size={16} color="#38bdf8" />}
            <span>{isBoardExpanded ? '기본 화면' : '바둑판 크게 보기'}</span>
          </button>
        )}

        <button
          onClick={onNewGame}
          className="glass-button primary"
          title="새 게임 시작"
        >
          <RotateCcw size={16} /> 새 대국
        </button>

        <button
          onClick={toggleSound}
          className="glass-button"
          style={{ padding: '0.6rem' }}
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
        >
          {soundEnabled ? <Volume2 size={18} color="var(--accent-blue)" /> : <VolumeX size={18} color="var(--text-muted)" />}
        </button>

        {/* Update Time Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          marginLeft: '0.5rem'
        }}>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span>업데이트: <strong style={{ color: '#f8fafc', fontWeight: 600 }}>2026.07.22 03:40 KST (KT Cloud 프로 9단 KataGo 1.16.4 엔진 완벽 연동 / 내장 및 임의 AI 착수 100% 제거 & 카톡 브라우저 탈출 및 홈 화면 아이콘 설치 완비)</strong></span>
        </div>
      </div>
    </header>
  );
};
