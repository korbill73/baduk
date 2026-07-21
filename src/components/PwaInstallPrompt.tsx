import React, { useState, useEffect } from 'react';
import { Smartphone, Share2, PlusCircle, X } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 독립 실행형(Standalone/PWA) 모드로 열렸는지 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // iOS Safari 여부 판별
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null; // 이미 앱으로 설치되어 실행 중일 경우 버튼 감춤
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // 자동 설치 프롬프트 미지원 기기(iOS Safari 또는 일반 PC 브라우저 등)를 위해 안내 모달 표시
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.35))',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: '#38bdf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 10px rgba(14, 165, 233, 0.15)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(14, 165, 233, 0.55))';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.35))';
          e.currentTarget.style.transform = 'none';
        }}
        title="스마트폰이나 PC 바탕화면에 앱 아이콘을 추가하여 진짜 앱처럼 이용하세요"
      >
        <Smartphone size={16} />
        <span>앱 설치 (아이콘 생성)</span>
      </button>

      {/* 안내 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            width: '90%',
            maxWidth: '480px',
            padding: '1.8rem',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--text-main)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Smartphone size={26} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                📲 바탕화면에 앱 아이콘 생성 안내
              </h3>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.4rem' }}>
              현재 사용 중이신 기기에서 아래 <strong>3초 간편 설정</strong>을 진행하시면 스마트폰/PC 홈 화면에 바둑 도장 전용 아이콘이 생성되어 진짜 앱처럼 편하게 접속할 수 있습니다!
            </p>

            {isIOS ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                <div style={{ fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🍎 아이폰 / 아이패드 (Safari) 설정법
                </div>
                <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                  1. 브라우저 맨 아래(또는 상단)의 <strong>공유버튼 (<Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong>을 터치합니다.<br />
                  2. 메뉴 창을 위로 올려 <strong>[홈 화면에 추가 (<PlusCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />)]</strong> 항목을 선택합니다.<br />
                  3. 우측 상단의 <strong>[추가]</strong>를 누르시면 배경화면에 9단 바둑 앱 아이콘이 생성됩니다!
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                <div style={{ fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🤖 안드로이드 (Chrome / 삼성인터넷) 또는 PC 설정법
                </div>
                <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                  1. 브라우저 우측 상단의 <strong>점 3개(⋮) 메뉴</strong>를 클릭합니다.<br />
                  2. <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong> 버튼을 누르세요.<br />
                  3. 홈 화면에 생성된 아이콘을 누르면 주소창 없는 100% 전체 화면 앱으로 실행됩니다!
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
};
