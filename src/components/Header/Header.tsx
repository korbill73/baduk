import React, { useState, useEffect, useRef } from 'react';
import type { GameMode, BoardSize, RankInfo } from '../../types/go';
import { Volume2, VolumeX, Award, BookOpen, Play, RotateCcw, HelpCircle, Users, Globe, User, Maximize2, Minimize2, LogIn, ShieldCheck, Menu, Download, Sparkles } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';
import { KataGoBridge } from '../../ai/KataGoBridge';

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
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Listen to KataGo bridge status
  useEffect(() => {
    return KataGoBridge.onStatusChange((enabled) => {
      setIsKataGoConnected(enabled);
    });
  }, []);

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
      padding: '0.65rem 1.4rem',
      marginBottom: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
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
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #f8fafc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Baduk AI Master Class
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: 500 }}>
            18급부터 9단까지 함께 성장하는 맞춤 AI 바둑 도장
          </p>
        </div>
      </div>

      {/* Main Navigation Controls Group */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        {/* User Profile / Login Button */}
        {!currentUser && onOpenLoginModal ? (
          <button
            onClick={onOpenLoginModal}
            className="glass-button"
            style={{ borderColor: '#f59e0b', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.28))', gap: '0.45rem', padding: '0.52rem 1rem' }}
            title="클라우드 전적 DB 로그인 및 가입"
          >
            <LogIn size={16} color="#fbbf24" />
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>로그인 / 가입</span>
          </button>
        ) : (
          <button
            onClick={onOpenProfileModal}
            className="glass-button"
            style={{ borderColor: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', gap: '0.45rem', padding: '0.52rem 1rem' }}
            title="내 기사 ID 및 대국 전적 조회"
          >
            <User size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, color: '#fff' }}>{myNickname}</span>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(245,158,11,0.22)', padding: '2px 7px', borderRadius: '8px', fontWeight: 700 }}>{myRankTitle}</span>
          </button>
        )}

        {/* Admin Dashboard Button */}
        {isAdmin && onOpenAdminDashboard && (
          <button
            onClick={onOpenAdminDashboard}
            className="glass-button"
            style={{
              borderColor: '#fbbf24',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(180, 83, 9, 0.4))',
              gap: '0.45rem',
              padding: '0.52rem 0.95rem'
            }}
            title="관리자 전적/회원/통계 대시보드"
          >
            <ShieldCheck size={16} color="#fbbf24" />
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>관리자 센터</span>
          </button>
        )}

        {/* Board Size and AI Rank (Only in Play Mode) */}
        {mode === 'play' && (
          <>
            <select
              value={boardSize}
              onChange={(e) => setBoardSize(Number(e.target.value) as BoardSize)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '0.52rem 0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <option value={19} style={{ background: '#1e293b' }}>19x19 바둑판</option>
              <option value={13} style={{ background: '#1e293b' }}>13x13 바둑판</option>
              <option value={9} style={{ background: '#1e293b' }}>9x9 바둑판</option>
            </select>

            <button
              onClick={onOpenRankSelector}
              className="glass-button"
              style={{ borderColor: aiRank.badgeColor, padding: '0.52rem 0.95rem' }}
            >
              <Award size={18} style={{ color: aiRank.badgeColor }} />
              <span>AI 난이도: <strong style={{ color: aiRank.badgeColor }}>{aiRank.name}</strong></span>
            </button>
          </>
        )}

        {mode === 'online' && (
          <button
            onClick={onOpenOnlineModal}
            className="glass-button"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', fontWeight: 700, borderColor: '#38bdf8', padding: '0.52rem 1rem' }}
          >
            <Globe size={16} /> 방 만들기 / 초대 링크 접속
          </button>
        )}

        {/* Mode Navigation Top-Down Dropdown Menu */}
        <div ref={modeDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setIsModeDropdownOpen(prev => !prev);
              setIsMenuDropdownOpen(false);
            }}
            className="glass-button"
            style={{
              padding: '0.52rem 1.15rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
              borderColor: '#38bdf8',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            {mode === 'play' && <><Play size={17} color="#38bdf8" /> <span>모드: <strong>AI 대국</strong></span></>}
            {mode === 'pvp' && <><Users size={17} color="#a855f7" /> <span>모드: <strong>1:1 대국</strong></span></>}
            {mode === 'online' && <><Globe size={17} color="#38bdf8" /> <span>모드: <strong>온라인 1:1</strong></span></>}
            {mode === 'review' && <><BookOpen size={17} color="#10b981" /> <span>모드: <strong>AI 복기</strong></span></>}
            {mode === 'tsumego' && <><HelpCircle size={17} color="#fbbf24" /> <span>모드: <strong>사활 문제</strong></span></>}
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginLeft: '3px', transition: 'transform 0.2s', transform: isModeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {isModeDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 2000,
              minWidth: '260px',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <button
                onClick={() => { setMode('play'); setIsModeDropdownOpen(false); }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'play' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: mode === 'play' ? '#38bdf8' : '#e2e8f0',
                  fontWeight: mode === 'play' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
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
                onClick={() => { setMode('pvp'); setIsModeDropdownOpen(false); }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'pvp' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                  color: mode === 'pvp' ? '#c084fc' : '#e2e8f0',
                  fontWeight: mode === 'pvp' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
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
                onClick={() => { setMode('online'); onOpenOnlineModal(); setIsModeDropdownOpen(false); }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'online' ? 'rgba(14, 165, 233, 0.3)' : 'transparent',
                  color: mode === 'online' ? '#38bdf8' : '#e2e8f0',
                  fontWeight: mode === 'online' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
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
                onClick={() => { setMode('review'); setIsModeDropdownOpen(false); }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'review' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                  color: mode === 'review' ? '#34d399' : '#e2e8f0',
                  fontWeight: mode === 'review' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
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
                onClick={() => { setMode('tsumego'); setIsModeDropdownOpen(false); }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: mode === 'tsumego' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                  color: mode === 'tsumego' ? '#fbbf24' : '#e2e8f0',
                  fontWeight: mode === 'tsumego' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
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

        {/* Action Buttons */}
        <button
          onClick={onNewGame}
          className="glass-button primary"
          style={{ padding: '0.52rem 0.95rem' }}
          title="새 게임 시작"
        >
          <RotateCcw size={16} /> 새 대국
        </button>

        <button
          onClick={toggleSound}
          className="glass-button"
          style={{ padding: '0.52rem 0.7rem' }}
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
        >
          {soundEnabled ? <Volume2 size={18} color="var(--accent-blue)" /> : <VolumeX size={18} color="var(--text-muted)" />}
        </button>

        {/* Top-Down Menu Button containing App Install, KataGo Guidance, and Board Expand */}
        <div ref={menuDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setIsMenuDropdownOpen(prev => !prev);
              setIsModeDropdownOpen(false);
            }}
            className="glass-button"
            style={{
              padding: '0.52rem 1rem',
              background: isMenuDropdownOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.85)',
              borderColor: isMenuDropdownOpen ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s'
            }}
            title="바둑 안내 및 부가 도구 탑다운 메뉴"
          >
            <Menu size={17} color="#38bdf8" />
            <span>도구 및 안내</span>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', transition: 'transform 0.2s', transform: isMenuDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {isMenuDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 2000,
              minWidth: '240px',
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* App Install in Top-Down Menu */}
              <button
                onClick={handleInstallClick}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <Download size={17} />
                <div>
                  <div style={{ fontSize: '0.9rem' }}>📱 홈 화면 앱 설치</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>바탕화면에 바로가기 아이콘 생성</div>
                </div>
              </button>

              {/* KataGo Guidance in Top-Down Menu */}
              <button
                onClick={() => {
                  onOpenAiEngineModal();
                  setIsMenuDropdownOpen(false);
                }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isKataGoConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: isKataGoConnected ? '#22c55e' : '#e2e8f0',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <Sparkles size={17} color={isKataGoConnected ? '#22c55e' : '#38bdf8'} />
                <div>
                  <div style={{ fontSize: '0.9rem' }}>{isKataGoConnected ? '🟢 바둑 및 KataGo AI 안내' : '📖 바둑 및 KataGo AI 안내'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>프로 9단 엔진 및 마스터클래스 가이드</div>
                </div>
              </button>

              {/* Board Expand/Shrink in Top-Down Menu */}
              {onToggleBoardExpand && (
                <button
                  onClick={() => {
                    onToggleBoardExpand();
                    setIsMenuDropdownOpen(false);
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isBoardExpanded ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: isBoardExpanded ? '#fbbf24' : '#e2e8f0',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {isBoardExpanded ? <Minimize2 size={17} color="#fbbf24" /> : <Maximize2 size={17} color="#38bdf8" />}
                  <div>
                    <div style={{ fontSize: '0.9rem' }}>{isBoardExpanded ? '기본 바둑판 크기' : '바둑판 크게 보기'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{isBoardExpanded ? '일반 화면 크기로 복귀' : '한게임 스타일 바둑판 확대 모드'}</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
