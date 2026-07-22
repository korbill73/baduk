import React, { useState, useEffect } from 'react';
import { firebaseBridge } from '../../core/FirebaseService';
import { X, Key, CheckCircle2, ShieldAlert, Sparkles, Mail, Lock, User } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any, profile: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'config'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Firebase Config Fields
  const localKey = localStorage.getItem('baduk_fb_api_key');
  const [apiKey, setApiKey] = useState((localKey && localKey.startsWith('AIzaSy') && localKey.length > 30) ? localKey : 'AIzaSyBTILF88F3pxJB4AnsJICNw1i81BJpt37I');
  const [authDomain, setAuthDomain] = useState(localStorage.getItem('baduk_fb_auth_domain') || 'baduk-58092.firebaseapp.com');
  const [projectId, setProjectId] = useState(localStorage.getItem('baduk_fb_project_id') || 'baduk-58092');
  const [isConfigured, setIsConfigured] = useState(firebaseBridge.isConfigured());

  useEffect(() => {
    if (!isConfigured) {
      setTab('config');
    }
  }, [isConfigured]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await firebaseBridge.loginWithGoogle();
      const profile = await firebaseBridge.syncUserToDb(user);
      onLoginSuccess(user, profile);
      onClose();
    } catch (e: any) {
      setErrorMsg(`구글 로그인 실패: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      let user, profile;
      if (tab === 'login') {
        user = await firebaseBridge.loginWithEmail(email, password);
        profile = await firebaseBridge.syncUserToDb(user);
      } else {
        if (!nickname.trim()) throw new Error('닉네임을 입력해주세요.');
        user = await firebaseBridge.signupWithEmail(email, password, nickname);
        profile = await firebaseBridge.syncUserToDb(user, nickname);
      }
      onLoginSuccess(user, profile);
      onClose();
    } catch (e: any) {
      let msg = e.message || String(e);
      if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
      if (msg.includes('auth/email-already-in-use')) msg = '이미 가입된 이메일 주소입니다.';
      if (msg.includes('auth/weak-password')) msg = '비밀번호는 최소 6자 이상이어야 합니다.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('API Key와 Project ID를 정확히 입력해주세요.');
      return;
    }
    const success = firebaseBridge.saveCustomConfig(apiKey, authDomain, projectId);
    if (success) {
      setIsConfigured(true);
      setErrorMsg(null);
      setTab('login');
      alert('✅ Firebase API 키가 성공적으로 저장 및 연결되었습니다!');
    } else {
      setErrorMsg('Firebase 초기화에 실패했습니다. 키 값을 다시 확인해주세요.');
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          <X size={22} />
        </button>

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.3))',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
          }}>
            <Sparkles size={28} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {tab === 'config' ? '🔥 Firebase 서버 연결 설정' : '🏆 바둑 마스터클래스 로그인'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {tab === 'config' ? '발급받으신 Firebase API 키를 입력하면 즉시 클라우드 전적 DB가 가동됩니다.' : '로그인하여 나만의 기력 성장 기록과 단급 전적을 클라우드에 영구 저장하세요!'}
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isConfigured ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: '0.4rem',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '5px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.4rem',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={() => { if (isConfigured) setTab('login'); }}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'login' ? 'var(--accent-blue)' : 'transparent',
              color: tab === 'login' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: isConfigured ? 'pointer' : 'not-allowed',
              opacity: isConfigured ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            로그인
          </button>
          <button
            onClick={() => { if (isConfigured) setTab('signup'); }}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === 'signup' ? 'var(--accent-blue)' : 'transparent',
              color: tab === 'signup' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: isConfigured ? 'pointer' : 'not-allowed',
              opacity: isConfigured ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            회원가입
          </button>
          {!isConfigured && (
            <button
              onClick={() => setTab('config')}
              style={{
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === 'config' ? '#f59e0b' : 'transparent',
                color: tab === 'config' ? '#000' : '#fbbf24',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <Key size={14} /> 키 설정
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.2rem',
            color: '#fca5a5',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB: CONFIG (Enter Firebase Keys) */}
        {tab === 'config' && (
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.7rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#fcd34d', lineHeight: 1.4 }}>
              📌 Firebase 콘솔(`console.firebase.google.com`)의 <strong>[프로젝트 설정 &gt; 내 앱 &gt; SDK 설정 및 구성]</strong>에서 발급된 3가지 핵심 값을 입력해주세요.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                API Key (apiKey) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Project ID (projectId) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="baduk-master-..."
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Auth Domain (authDomain) (선택)
              </label>
              <input
                type="text"
                placeholder="baduk-master-....firebaseapp.com"
                value={authDomain}
                onChange={e => setAuthDomain(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="glass-button primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.96rem',
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderColor: '#fbbf24'
              }}
            >
              <CheckCircle2 size={18} /> Firebase 연결 저장 및 가동
            </button>
          </form>
        )}

        {/* TAB: LOGIN & SIGNUP */}
        {(tab === 'login' || tab === 'signup') && (
          <div>
            {/* Google Social Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#fff',
                color: '#1f2937',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.94rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                marginBottom: '1.25rem',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
              </svg>
              Google 계정으로 1초 로그인
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>또는 이메일로 {tab === 'login' ? '로그인' : '가입'}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {tab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>기사 닉네임</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="예: 이세돌9단, 바둑마스터"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        color: '#fff',
                        fontSize: '0.88rem'
                      }}
                      required={tab === 'signup'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>이메일 주소</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>비밀번호 (6자 이상)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-button primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? '처리 중...' : tab === 'login' ? '이메일 로그인' : '무료 회원가입 완료'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
