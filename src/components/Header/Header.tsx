import React, { useState, useEffect } from 'react';
import type { GameMode, BoardSize, RankInfo } from '../../types/go';
import { Volume2, VolumeX, Award, BookOpen, Play, RotateCcw, HelpCircle, Users, Globe, User, Maximize2, Minimize2, LogIn, ShieldCheck } from 'lucide-react';
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
  onOpenLoginModal?: () => void;
  onOpenAdminDashboard?: () => void;
  currentUser?: any;
  isAdmin?: boolean;
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
  onOpenLoginModal,
  onOpenAdminDashboard,
  currentUser,
  isAdmin,
  myNickname,
  myRankTitle,
  onNewGame,
  soundEnabled,
  setSoundEnabled,
  isBoardExpanded = false,
  onToggleBoardExpand,
}) => {
  const [isKataGoConnected, setIsKataGoConnected] = useState(KataGoBridge.getConfig().enabled);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      padding: '0.55rem 1.2rem',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.8rem'
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
            18급부터 9단까지 함께 성장하는 맞춤 AI 바둑 도장
          </p>
        </div>
      </div>

      {/* Mode navigation (Top-Down Dropdown Menu for clean UI) */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(prev => !prev)}
          className="glass-button"
          style={{
            padding: '0.55rem 1.15rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            borderColor: '#38bdf8',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.94rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          {mode === 'play' && <><Play size={18} color="#38bdf8" /> <span>🎮 대국 모드: <strong>AI 대국 (vs AI)</strong></span></>}
          {mode === 'pvp' && <><Users size={18} color="#a855f7" /> <span>🎮 대국 모드: <strong>1:1 대국 (로컬)</strong></span></>}
          {mode === 'online' && <><Globe size={18} color="#38bdf8" /> <span>🎮 대국 모드: <strong>온라인 1:1 (P2P)</strong></span></>}
          {mode === 'review' && <><BookOpen size={18} color="#10b981" /> <span>🎮 대국 모드: <strong>AI 복기 (Review)</strong></span></>}
          {mode === 'tsumego' && <><HelpCircle size={18} color="#fbbf24" /> <span>🎮 대국 모드: <strong>사활 문제 (Tsumego)</strong></span></>}
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginLeft: '4px', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 1000,
            minWidth: '260px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            <button
              onClick={() => { setMode('play'); setIsDropdownOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'play' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: mode === 'play' ? '#38bdf8' : '#e2e8f0',
                fontWeight: mode === 'play' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <Play size={18} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.92rem' }}>AI 대국 (vs AI)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>KataGo AI와 맞춤형 지도 대국</div>
              </div>
            </button>

            <button
              onClick={() => { setMode('pvp'); setIsDropdownOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'pvp' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: mode === 'pvp' ? '#c084fc' : '#e2e8f0',
                fontWeight: mode === 'pvp' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <Users size={18} color="#a855f7" />
              <div>
                <div style={{ fontSize: '0.92rem' }}>1:1 대국 (로컬)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>한 기기에서 친구와 함께 두기</div>
              </div>
            </button>

            <button
              onClick={() => { setMode('online'); onOpenOnlineModal(); setIsDropdownOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'online' ? 'rgba(14, 165, 233, 0.3)' : 'transparent',
                color: mode === 'online' ? '#38bdf8' : '#e2e8f0',
                fontWeight: mode === 'online' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <Globe size={18} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.92rem' }}>온라인 1:1 (P2P 방만들기)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>초대 링크로 실시간 원격 대국</div>
              </div>
            </button>

            <button
              onClick={() => { setMode('review'); setIsDropdownOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'review' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: mode === 'review' ? '#34d399' : '#e2e8f0',
                fontWeight: mode === 'review' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <BookOpen size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.92rem' }}>AI 복기 (Review)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>지난 대국 기보 복기 및 형세 검토</div>
              </div>
            </button>

            <button
              onClick={() => { setMode('tsumego'); setIsDropdownOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: mode === 'tsumego' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: mode === 'tsumego' ? '#fbbf24' : '#e2e8f0',
                fontWeight: mode === 'tsumego' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              <HelpCircle size={18} color="#fbbf24" />
              <div>
                <div style={{ fontSize: '0.92rem' }}>사활 문제 (Tsumego)</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>단계별 실전 사활 문제은행 풀이</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="header-actions-group">
        <PwaInstallPrompt />

        {/* User Profile / Login Button */}
        {!currentUser && onOpenLoginModal ? (
          <button
            onClick={onOpenLoginModal}
            className="glass-button"
            style={{ borderColor: '#f59e0b', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.25))', gap: '0.4rem', padding: '0.5rem 0.9rem' }}
            title="클라우드 전적 DB 로그인 및 가입"
          >
            <LogIn size={16} color="#fbbf24" />
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>로그인 / 가입</span>
          </button>
        ) : (
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
        )}

        {/* Admin Dashboard Button */}
        {isAdmin && onOpenAdminDashboard && (
          <button
            onClick={onOpenAdminDashboard}
            className="glass-button"
            style={{
              borderColor: '#fbbf24',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(180, 83, 9, 0.35))',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem'
            }}
            title="관리자 전적/회원/통계 대시보드"
          >
            <ShieldCheck size={16} color="#fbbf24" />
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>관리자 센터</span>
          </button>
        )}

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
              title="KataGo AI 엔진 소개 및 바둑 마스터클래스 안내"
            >
              <span style={{ fontSize: '1rem' }}>{isKataGoConnected ? '🟢' : '📖'}</span>
              <span style={{ fontWeight: 600, color: isKataGoConnected ? '#22c55e' : '#38bdf8' }}>
                {isKataGoConnected ? 'KataGo AI 및 바둑 안내' : 'KataGo AI 소개 매뉴얼'}
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
