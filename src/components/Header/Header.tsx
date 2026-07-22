import React, { useState, useEffect, useRef } from 'react';
import type { GameMode, BoardSize, RankInfo } from '../../types/go';
import { Volume2, VolumeX, Award, BookOpen, Play, RotateCcw, HelpCircle, Users, Globe, User, LogIn, LogOut, ShieldCheck, Menu, Download } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface HeaderProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  boardSize: BoardSize;
  setBoardSize: (size: BoardSize) => void;
  aiRank: RankInfo;
  onOpenRankSelector: () => void;
  onOpenAiEngineModal?: () => void;
  onOpenOnlineModal: () => void;
  onOpenProfileModal: () => void;
  onOpenLoginModal?: () => void;
  onOpenAdminDashboard?: () => void;
  currentUser?: any;
  isAdmin?: boolean;
  myNickname: string;
  myRankTitle: string;
  myStats?: { vsAiWins?: number; vsAiLosses?: number; onlineWins?: number; onlineLosses?: number; pvpWins?: number; pvpLosses?: number };
  onLogout?: () => void;
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
  onOpenOnlineModal,
  onOpenProfileModal,
  onOpenLoginModal,
  onOpenAdminDashboard,
  currentUser,
  isAdmin,
  myNickname,
  myRankTitle,
  myStats,
  onLogout,
  onNewGame,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);



  // Capture PWA install event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Close top-down menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setIsModeDropdownOpen(false);
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target as Node)) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const handleInstallClick = async () => {
    setIsMenuDropdownOpen(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('📌 브라우저 메뉴의 [홈 화면에 추가] 또는 [앱 설치]를 선택하시면 바탕화면에 바둑 아이콘이 생성됩니다.');
    }
  };

  return (
    <header className="glass-panel" style={{
      padding: '0.45rem 0.9rem',
      marginBottom: '0.65rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible',
      gap: '0.6rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <div className="header-brand-icon" style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e2025 50%, #f8fafc 50%)',
          border: '2px solid #38bdf8',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-45deg)',
          flexShrink: 0
        }} />
        <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', background: 'linear-gradient(90deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Baduk AI Master Class
        </h1>
      </div>

      {/* Controls Group */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        flexWrap: 'nowrap',
      }}>
        {/* Board Size (Play mode) */}
        {mode === 'play' && (
          <select
            value={boardSize}
            onChange={(e) => setBoardSize(Number(e.target.value) as BoardSize)}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#f8fafc',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.42rem 0.65rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              outline: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <option value={19} style={{ background: '#0f172a' }}>19x19 판</option>
            <option value={13} style={{ background: '#0f172a' }}>13x13 판</option>
            <option value={9} style={{ background: '#0f172a' }}>9x9 판</option>
          </select>
        )}

        {/* AI Lookahead Selector Button */}
        {mode === 'play' && (
          <button
            onClick={onOpenRankSelector}
            className="glass-button"
            style={{
              padding: '0.42rem 0.7rem',
              fontSize: '0.8rem',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              background: 'rgba(15, 23, 42, 0.85)',
              whiteSpace: 'nowrap'
            }}
            title="AI 수읽기 깊이 변경"
          >
            <Award size={15} color={aiRank.badgeColor} />
            <span>AI 수읽기: <strong style={{ color: aiRank.badgeColor }}>{aiRank.name}</strong></span>
          </button>
        )}

        {/* Online Room Button */}
        {mode === 'online' && (
          <button
            onClick={onOpenOnlineModal}
            className="glass-button"
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: '#fff',
              fontWeight: 700,
              borderColor: '#38bdf8',
              padding: '0.42rem 0.7rem',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Globe size={15} /> 초대전 대기실
          </button>
        )}

        {/* Mode Navigation Dropdown */}
        <div ref={modeDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setIsModeDropdownOpen(prev => !prev);
              setIsMenuDropdownOpen(false);
            }}
            className="glass-button"
            style={{
              padding: '0.42rem 0.75rem',
              background: 'rgba(15, 23, 42, 0.85)',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
          >
            {mode === 'play' && <><Play size={15} color="#38bdf8" /> <span>모드: <strong>AI 대국</strong></span></>}
            {mode === 'pvp' && <><Users size={15} color="#a855f7" /> <span>모드: <strong>1:1 로컬</strong></span></>}
            {mode === 'online' && <><Globe size={15} color="#38bdf8" /> <span>모드: <strong>온라인 P2P</strong></span></>}
            {mode === 'review' && <><BookOpen size={15} color="#10b981" /> <span>모드: <strong>AI 복기</strong></span></>}
            {mode === 'tsumego' && <><HelpCircle size={15} color="#fbbf24" /> <span>모드: <strong>사활 도전</strong></span></>}
            <span style={{ fontSize: '0.65rem', color: '#38bdf8', transition: 'transform 0.2s', transform: isModeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {isModeDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 9999,
              minWidth: '230px',
              maxWidth: 'calc(100vw - 20px)',
              background: 'rgba(8, 15, 30, 0.98)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(16px)',
              padding: '0.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}>
              <button onClick={() => { setMode('play'); setIsModeDropdownOpen(false); }} style={{ padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === 'play' ? 'rgba(56, 189, 248, 0.25)' : 'transparent', color: mode === 'play' ? '#38bdf8' : '#e2e8f0', fontWeight: mode === 'play' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <Play size={16} color="#38bdf8" />
                <div><div style={{ fontSize: '0.86rem' }}>AI 대국 (vs AI)</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>KataGo AI 맞춤 수읽기 대국</div></div>
              </button>
              <button onClick={() => { setMode('pvp'); setIsModeDropdownOpen(false); }} style={{ padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === 'pvp' ? 'rgba(168, 85, 247, 0.25)' : 'transparent', color: mode === 'pvp' ? '#c084fc' : '#e2e8f0', fontWeight: mode === 'pvp' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <Users size={16} color="#a855f7" />
                <div><div style={{ fontSize: '0.86rem' }}>1:1 대국 (로컬)</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>한 화면에서 두 사람이 대국</div></div>
              </button>
              <button onClick={() => { setMode('online'); onOpenOnlineModal(); setIsModeDropdownOpen(false); }} style={{ padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === 'online' ? 'rgba(14, 165, 233, 0.3)' : 'transparent', color: mode === 'online' ? '#38bdf8' : '#e2e8f0', fontWeight: mode === 'online' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <Globe size={16} color="#38bdf8" />
                <div><div style={{ fontSize: '0.86rem' }}>온라인 1:1 (P2P 초대)</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>링크 공유로 실시간 원격 대국</div></div>
              </button>
              <button onClick={() => { setMode('review'); setIsModeDropdownOpen(false); }} style={{ padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === 'review' ? 'rgba(16, 185, 129, 0.25)' : 'transparent', color: mode === 'review' ? '#34d399' : '#e2e8f0', fontWeight: mode === 'review' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <BookOpen size={16} color="#10b981" />
                <div><div style={{ fontSize: '0.86rem' }}>AI 복기 (Review)</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>지난 기보 복기 및 형세 분석</div></div>
              </button>
              <button onClick={() => { setMode('tsumego'); setIsModeDropdownOpen(false); }} style={{ padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === 'tsumego' ? 'rgba(245, 158, 11, 0.25)' : 'transparent', color: mode === 'tsumego' ? '#fbbf24' : '#e2e8f0', fontWeight: mode === 'tsumego' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <HelpCircle size={16} color="#fbbf24" />
                <div><div style={{ fontSize: '0.86rem' }}>사활 / 묘수 풀이</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>실전 사활 문제 풀이 훈련</div></div>
              </button>
            </div>
          )}
        </div>

        {/* New Game & Sound Action Buttons */}
        <button onClick={onNewGame} className="glass-button primary" style={{ padding: '0.42rem 0.7rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title="새 게임 시작">
          <RotateCcw size={15} /> 새 대국
        </button>

        <button onClick={toggleSound} className="glass-button" style={{ padding: '0.42rem 0.55rem' }} title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}>
          {soundEnabled ? <Volume2 size={16} color="#38bdf8" /> : <VolumeX size={16} color="var(--text-muted)" />}
        </button>

        {/* User Profile Button */}
        {currentUser ? (
          <button onClick={onOpenProfileModal} className="glass-button" style={{ borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.42rem 0.7rem', fontSize: '0.8rem', gap: '0.35rem', whiteSpace: 'nowrap' }} title="내 프로필 및 기보 기록 보기">
            <User size={15} color="#38bdf8" />
            <span style={{ fontWeight: 700, color: '#fff' }}>{myNickname}</span>
            <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245,158,11,0.2)', padding: '1px 5px', borderRadius: '5px', fontWeight: 700 }}>{myRankTitle}</span>
            {myStats && (
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                🏆 {((myStats.vsAiWins||0)+(myStats.onlineWins||0)+(myStats.pvpWins||0))}승{((myStats.vsAiLosses||0)+(myStats.onlineLosses||0)+(myStats.pvpLosses||0))}패
              </span>
            )}
          </button>
        ) : (
          onOpenLoginModal && (
            <button onClick={onOpenLoginModal} className="glass-button" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: '0.42rem 0.75rem', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800, gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <LogIn size={15} color="#fbbf24" />
              <span>로그인 / 가입</span>
            </button>
          )
        )}

        {/* Admin Dashboard Button (Direct Access for Admin) */}
        {isAdmin && onOpenAdminDashboard && (
          <button onClick={onOpenAdminDashboard} className="glass-button" style={{ borderColor: '#fbbf24', background: 'rgba(245, 158, 11, 0.25)', padding: '0.42rem 0.75rem', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800, gap: '0.35rem', whiteSpace: 'nowrap' }} title="관리자 대시보드">
            <ShieldCheck size={15} color="#fbbf24" />
            <span>관리자 센터</span>
          </button>
        )}

        {/* Logout Button (Direct Access for Logged in Users) */}
        {currentUser && onLogout && (
          <button
            onClick={() => {
              if (window.confirm('바둑 마스터클래스 계정에서 로그아웃 하시겠습니까?')) {
                onLogout();
              }
            }}
            className="glass-button"
            style={{
              borderColor: 'rgba(244, 63, 94, 0.5)',
              background: 'rgba(244, 63, 94, 0.18)',
              color: '#fda4af',
              padding: '0.42rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              gap: '0.35rem',
              whiteSpace: 'nowrap'
            }}
            title="계정 로그아웃"
          >
            <LogOut size={15} color="#fda4af" />
            <span>로그아웃</span>
          </button>
        )}

        {/* Settings & Tools Dropdown Button */}
        <div ref={menuDropdownRef} style={{ position: 'relative' }}>
          <button onClick={() => { setIsMenuDropdownOpen(prev => !prev); setIsModeDropdownOpen(false); }} className="glass-button" style={{ padding: '0.42rem 0.65rem', background: isMenuDropdownOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)', borderColor: isMenuDropdownOpen ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }} title="부가 설정 메뉴">
            <Menu size={15} color="#38bdf8" />
            <span>설정</span>
            <span style={{ fontSize: '0.62rem', color: '#38bdf8', transition: 'transform 0.2s', transform: isMenuDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {isMenuDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 9999,
              minWidth: '210px',
              maxWidth: 'calc(100vw - 20px)',
              background: 'rgba(8, 15, 30, 0.98)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(16px)',
              padding: '0.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}>
              {/* App Install */}
              <button
                onClick={handleInstallClick}
                style={{
                  padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.55rem', textAlign: 'left',
                }}
              >
                <Download size={16} />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>📱 홈 화면 앱 설치</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>바탕화면에 바로가기 생성</div>
                </div>
              </button>

              {/* Profile & History Access */}
              <button
                onClick={() => {
                  onOpenProfileModal();
                  setIsMenuDropdownOpen(false);
                }}
                style={{
                  padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'transparent', color: '#e2e8f0', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.55rem', textAlign: 'left',
                }}
              >
                <User size={16} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>👤 내 기보 및 전적 관리</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>클라우드 전적 상세 분석</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
