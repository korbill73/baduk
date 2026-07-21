import React, { useState, useEffect } from 'react';
import { Smartphone, Share2, PlusCircle, X, ExternalLink, Copy, Check, MessageCircle } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 이미 독립 실행형(Standalone/PWA) 모드로 열렸는지 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 사용자 기기 및 인앱 브라우저(카카오톡, 인스타그램, 네이버 등) 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const androidDevice = /android/.test(userAgent);
    const inAppBrowser = /kakaotalk|instagram|naver|line|fb_iab|fbav/.test(userAgent);

    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);
    setIsInApp(inAppBrowser);

    // 안드로이드 카카오톡 접속 시 자동으로 구동 가능한 크롬 브라우저로 탈출(Intent) 시도
    if (inAppBrowser && androidDevice && userAgent.includes('kakaotalk')) {
      try {
        const currentUrl = window.location.href.replace(/https?:\/\//i, '');
        const intentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
        // 자동 전환 시도 (브라우저 정책상 차단될 경우를 대비해 모달 안내도 병행)
        setTimeout(() => {
          window.location.href = intentUrl;
        }, 800);
      } catch (e) {}
    }

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
    return null;
  }

  const handleInstallClick = async () => {
    if (isInApp) {
      // 카카오톡/인앱 브라우저 접속 시 무조건 탈출 안내 모달 팝업
      setShowModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleEscapeAndroid = () => {
    const currentUrl = window.location.href.replace(/https?:\/\//i, '');
    window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <>
      {/* 카카오톡 등 인앱 브라우저로 접속 시 상단에 눈에 띄는 배너 자동 노출 */}
      {isInApp && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '500px',
          background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.95), rgba(250, 204, 21, 0.95))',
          color: '#1e293b',
          padding: '0.9rem 1.2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.8rem',
          zIndex: 1500,
          border: '2px solid #ca8a04'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageCircle size={24} color="#854d0e" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', lineHeight: 1.4, fontWeight: 600 }}>
              <span style={{ color: '#b45309', display: 'block', fontSize: '0.78rem' }}>⚠️ 카카오톡 브라우저 감지됨</span>
              앱 설치 & 정상 AI 연동을 위해 일반 브라우저로 열어주세요!
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            탈출 방법
          </button>
        </div>
      )}

      <button
        onClick={handleInstallClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: isInApp 
            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(234, 179, 8, 0.45))'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.35))',
          border: isInApp 
            ? '1px solid rgba(250, 204, 21, 0.6)' 
            : '1px solid rgba(56, 189, 248, 0.4)',
          color: isInApp ? '#fde047' : '#38bdf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 10px rgba(14, 165, 233, 0.15)'
        }}
        title="스마트폰이나 PC 바탕화면에 앱 아이콘을 추가하여 진짜 앱처럼 이용하세요"
      >
        <Smartphone size={16} />
        <span>{isInApp ? '🚀 카카오톡 탈출 & 앱 설치' : '앱 설치 (아이콘 생성)'}</span>
      </button>

      {/* 안내 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
            maxWidth: '500px',
            padding: '1.8rem',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--text-main)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
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

            {isInApp ? (
              /* 카카오톡 / 인앱 브라우저 전용 탈출 모달 */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  <MessageCircle size={28} color="#eab308" />
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                    💬 카카오톡 브라우저 탈출 안내
                  </h3>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.4rem' }}>
                  카카오톡, 인스타그램 등 인앱 브라우저에서는 애플 및 구글 보안 정책으로 인해 <strong>바탕화면 앱 설치 및 일부 AI 웹 소켓 연동이 제한</strong>됩니다.<br />
                  아래 안내에 따라 <strong>일반 브라우저(Safari 또는 Chrome)</strong>로 열어주시면 100% 완벽하게 작동합니다!
                </p>

                {isAndroid ? (
                  <div style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🤖 안드로이드 스마트폰이신가요?
                    </div>
                    <button
                      onClick={handleEscapeAndroid}
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                        color: '#fff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                        marginBottom: '0.8rem'
                      }}
                    >
                      <ExternalLink size={18} /> 구글 크롬(Chrome)으로 바로 열기
                    </button>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      * 위 버튼이 작동하지 않을 경우, 화면 우측 하단(또는 상단)의 <strong>[점 3개(⋯)] 메뉴</strong>를 누르고 <strong>[다른 브라우저로 열기]</strong>를 선택해 주세요.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(250, 204, 21, 0.1)',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.2rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontWeight: 700, color: '#fde047', marginBottom: '0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🍎 아이폰 / 아이패드 (iOS)이신가요?
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1rem' }}>
                      1. 화면 우측 하단의 <strong>[점 3개(⋯) 메뉴]</strong> 버튼을 터치합니다.<br />
                      2. 나타나는 목록에서 <strong>[Safari로 열기]</strong> 또는 <strong>[다른 브라우저로 열기]</strong>를 선택하세요!
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {window.location.href}
                      </span>
                      <button
                        onClick={handleCopyUrl}
                        style={{
                          background: copied ? '#22c55e' : 'rgba(255,255,255,0.15)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          flexShrink: 0
                        }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? '복사됨!' : '주소 복사'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 일반 브라우저에서 버튼 클릭 시 홈 화면 추가 안내 모달 */
              <div>
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
