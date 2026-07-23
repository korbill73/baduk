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
    <header className="glass-panel header-container" style={{
      padding: '0.45rem 0.9rem',
      marginBottom: '0.65rem',
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }}>
      {/* Top Row: Brand & Profile / User Actions */}
      <div className="header-top-row">
        {/* Brand & Logo + Current Rank Selector Button */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 1, minWidth: 0 }}>
          <div className="header-brand-icon" style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e2025 50%, #f8fafc 50%)',
            border: '2px solid #38bdf8',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-45deg)',
            flexShrink: 0
          }} />
          <h1 className="header-brand-title" style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', background: 'linear-gradient(90deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Baduk AI
          </h1>

          {/* Current Rank Selector Button (Opens Stage Selector Modal) */}
          {mode === 'play' && (
            <button
              onClick={onOpenRankSelector}
              className="glass-button header-rank-selector-btn"
              style={{
                padding: '0.28rem 0.55rem',
                fontSize: '0.74rem',
                borderColor: 'rgba(251, 191, 36, 0.5)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(30, 41, 59, 0.9))',
                color: '#fbbf24',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
                flexShrink: 0
              }}
              title="단계 선택 맵 열기"
            >
              <Award size={13} color={aiRank.badgeColor} />
              <strong style={{ color: aiRank.badgeColor, fontWeight: 800 }}>{aiRank.name}</strong>
            </button>
          )}
        </div>

        {/* Top User Actions (Profile, Admin, Logout, Settings) */}
        <div className="header-user-actions">
          {/* User Profile Button */}
          {currentUser ? (
            <button onClick={onOpenProfileModal} className="glass-button header-user-btn" style={{ borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.3rem', whiteSpace: 'nowrap' }} title="내 프로필 및 기보 기록 보기">
              <User size={14} color="#38bdf8" />
              <span style={{ fontWeight: 700, color: '#fff' }}>{myNickname}</span>
              <span className="header-rank-badge" style={{ fontSize: '0.68rem', color: '#fbbf24', background: 'rgba(245,158,11,0.2)', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>{myRankTitle}</span>
            </button>
          ) : (
            onOpenLoginModal && (
              <button onClick={onOpenLoginModal} className="glass-button header-login-btn" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, gap: '0.3rem', whiteSpace: 'nowrap' }}>
                <LogIn size={14} color="#fbbf24" />
                <span>로그인</span>
              </button>
            )
          )}

          {/* Admin Dashboard Button */}
          {isAdmin && onOpenAdminDashboard && (
            <button onClick={onOpenAdminDashboard} className="glass-button header-admin-btn" style={{ borderColor: '#fbbf24', background: 'rgba(245, 158, 11, 0.25)', padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, gap: '0.3rem', whiteSpace: 'nowrap' }} title="관리자 대시보드">
              <ShieldCheck size={14} color="#fbbf24" />
              <span className="btn-text-hide-mobile">관리자</span>
            </button>
          )}

          {/* Logout Button */}
          {currentUser && onLogout && (
            <button
              onClick={() => {
                if (window.confirm('로그아웃 하시겠습니까?')) {
                  onLogout();
                }
              }}
              className="glass-button header-logout-btn"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.5)',
                background: 'rgba(244, 63, 94, 0.18)',
                color: '#fda4af',
                padding: '0.35rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                gap: '0.3rem',
                whiteSpace: 'nowrap'
              }}
              title="로그아웃"
            >
              <LogOut size={14} color="#fda4af" />
              <span className="btn-text-hide-mobile">로그아웃</span>
            </button>
          )}

          {/* Settings & Tools Dropdown Button */}
          <div ref={menuDropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => { setIsMenuDropdownOpen(prev => !prev); setIsModeDropdownOpen(false); }} className="glass-button" style={{ padding: '0.35rem 0.55rem', background: isMenuDropdownOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)', borderColor: isMenuDropdownOpen ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }} title="부가 설정 메뉴">
              <Menu size={14} color="#38bdf8" />
              <span>설정</span>
              <span style={{ fontSize: '0.6rem', color: '#38bdf8', transition: 'transform 0.2s', transform: isMenuDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>

            {isMenuDropdownOpen && (
              <div className="header-dropdown-menu header-menu-dropdown" style={{
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
      </div>

      {/* Bottom Row: Game Controls & Mode Dropdown (Line 2 on Mobile) */}
      <div className="header-bottom-row">
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
              padding: '0.38rem 0.55rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              outline: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <option value={19} style={{ background: '#0f172a' }}>19x19</option>
            <option value={13} style={{ background: '#0f172a' }}>13x13</option>
            <option value={9} style={{ background: '#0f172a' }}>9x9</option>
          </select>
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
              padding: '0.38rem 0.6rem',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Globe size={14} /> 초대전 대기실
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
              padding: '0.38rem 0.6rem',
              background: 'rgba(15, 23, 42, 0.85)',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap'
            }}
          >
            {mode === 'play' && <><Play size={14} color="#38bdf8" /> <span>모드: <strong>AI 대국</strong></span></>}
            {mode === 'pvp' && <><Users size={14} color="#a855f7" /> <span>모드: <strong>1:1 로컬</strong></span></>}
            {mode === 'online' && <><Globe size={14} color="#38bdf8" /> <span>모드: <strong>온라인</strong></span></>}
            {mode === 'review' && <><BookOpen size={14} color="#10b981" /> <span>모드: <strong>AI 복기</strong></span></>}
            {mode === 'tsumego' && <><HelpCircle size={14} color="#fbbf24" /> <span>모드: <strong>사활 도전</strong></span></>}
            <span style={{ fontSize: '0.6rem', color: '#38bdf8', transition: 'transform 0.2s', transform: isModeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {isModeDropdownOpen && (
            <div className="header-dropdown-menu header-mode-dropdown" style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 9999,
              minWidth: '220px',
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
        <button onClick={onNewGame} className="glass-button primary" style={{ padding: '0.38rem 0.6rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }} title="새 게임 시작">
          <RotateCcw size={14} /> 새 대국
        </button>

        <button onClick={toggleSound} className="glass-button" style={{ padding: '0.38rem 0.5rem' }} title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}>
          {soundEnabled ? <Volume2 size={15} color="#38bdf8" /> : <VolumeX size={15} color="var(--text-muted)" />}
        </button>
      </div>
    </header>
  );
};
