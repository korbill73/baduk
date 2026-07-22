import React, { useState } from 'react';
import { KataGoBridge } from '../../ai/KataGoBridge';
import { Cpu, CheckCircle2, X, Wifi, Terminal, Download, ExternalLink, BookOpen, Award, Sparkles, Sliders } from 'lucide-react';

interface AiEngineModalProps {
  onClose: () => void;
}

export const AiEngineModal: React.FC<AiEngineModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState(KataGoBridge.getConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showManuals, setShowManuals] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const handleDownloadBat = () => {
    const batContent = `@echo off
chcp 65001 > nul
title 한게임 바둑 9단 카타고(KataGo) AI 원클릭 실행기
echo ========================================================
echo 🤖 한게임 바둑 9단 AI 로컬 엔진 자동 설치 및 구동을 시작합니다...
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [⚠️ 중요 안내] PC에 Node.js 프로그램이 설치되어 있지 않습니다!
  echo --------------------------------------------------------
  echo 1. 웹 브라우저를 열고 https://nodejs.org 사이트에 접속하세요.
  echo 2. 화면 중앙의 초록색 [LTS 버전 다운로드] 버튼을 눌러 설치해 주세요.
  echo 3. Node.js 설치가 완료된 후, 이 파일(run-katago-ai.bat)을 다시 더블클릭해 주시면 완료됩니다!
  echo --------------------------------------------------------
  pause
  exit /b
)

if not exist setup-katago-auto.mjs (
  echo 📡 카타고 9단 자동 설치 및 중계 스크립트를 안전하게 다운로드하고 있습니다...
  powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-auto.mjs' -OutFile 'setup-katago-auto.mjs'"
)

echo 🚀 카타고(KataGo) 엔진 및 신경망 서버를 구동합니다...
echo 이 창을 열어두신 상태로 웹 바둑에 접속하시면 자동으로 연동됩니다!
echo.
node setup-katago-auto.mjs
pause
`;
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run-katago-ai.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMjs = () => {
    window.open('https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-auto.mjs', '_blank');
  };

  const handleSave = () => {
    KataGoBridge.setConfig(config);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('외부 KataGo / AI 서버 연결을 확인하고 있습니다...');
    try {
      KataGoBridge.setConfig(config);
      // Try querying empty board center with forceTest=true
      const result = await Promise.race([
        KataGoBridge.queryKataGo(19, [], 'white', true),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 16000))
      ]);

      if (result && result.move) {
        setTestStatus('success');
        setTestMessage(`🎉 연결 성공! 외부 신경망 엔진이 응답했습니다 (추천 착수: ${KataGoBridge.pointToGtp(result.move)})`);
      } else {
        setTestStatus('failed');
        setTestMessage('⚠️ 서버 응답 시간이 초과되었거나 연결되지 않았습니다. 내장 고도화 엔진으로 안전하게 자동 전환됩니다.');
      }
    } catch (e: any) {
      setTestStatus('failed');
      setTestMessage(`⚠️ 연결 실패: ${e.message || '로컬/원격 서버에 접속할 수 없습니다.'}`);
    }
  };

  return (
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
      zIndex: 1100
    }}>
      <div className="glass-panel" style={{
        width: '90%',
        maxWidth: '680px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <BookOpen size={28} color="var(--accent-blue)" />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>KataGo AI 및 바둑 마스터클래스 안내</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                세계 최고 수준 딥러닝 인공지능과 함께하는 맞춤형 바둑 대국 및 훈련 가이드
              </p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Zero-Installation Automatic Connection Notice Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15))',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          fontSize: '0.88rem',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            🎉 100% 무설치 · 실시간 접속 완료: 24시간 고성능 프로 9단 KataGo AI 가동 중
          </strong>
          <span style={{ color: '#e2e8f0', display: 'block' }}>
            일반 사용자 및 방문자님께서는 <strong>별도의 프로그램 설치나 복잡한 서버 설정이 전혀 필요 없습니다!</strong><br />
            스마트폰, 태블릿, PC 어디서든 접속만 하시면 실시간으로 최고 수준 프로 9단 엔진과 대국 및 복기를 진행할 수 있습니다.<br />
            <em style={{ color: '#38bdf8' }}>💡 기본 대국 난이도는 입문자도 부담 없는 <strong>18급(입문)</strong>으로 설정되어 있으며, 상단 [🏆 AI 난이도 선택] 버튼을 통해 단급(18급~9단)을 자유롭게 조절할 수 있습니다.</em>
          </span>
        </div>

        {/* User Friendly Manual Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Sparkles size={18} /> KataGo(카타고) AI 인공지능이란?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
              <strong>KataGo</strong>는 알파고(AlphaGo Zero)의 최신 논문을 바탕으로 한층 더 진화한 오픈소스 딥러닝 바둑 인공지능입니다. 단순히 승패만 가리는 것을 넘어, <strong>실시간 승률 변화, 형세 판단, 집 차이 예측, 그리고 4수 앞서보기 코칭</strong>을 통해 사용자의 기력 향상을 돕는 최고의 파트너입니다.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Award size={18} /> 바둑 마스터클래스 핵심 기능 안내
            </h3>
            <ul style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7 }}>
              <li><strong>18급 ~ 9단 맞춤 난이도</strong>: AI가 선택된 단급에 맞춰 수읽기 탐색 횟수(1회~300회)와 실력을 정밀 차등 제어합니다.</li>
              <li><strong>단계별 사활 문제은행 (Tsumego)</strong>: 입문부터 최고수까지 단계별 실전 사활 풀이 및 실시간 오답 노트 지원.</li>
              <li><strong>일본식 / 중국식 실리 계가</strong>: 사석과 공배를 자동 계산하여 실시간으로 정확한 형세를 진단합니다.</li>
            </ul>
          </div>
        </div>

        {/* Advanced Server Configuration Section (Collapsible) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div>
              <strong style={{ color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} color="var(--accent-blue)" /> [고급 설정] 커스텀 AI 서버 주소 변경 및 테스트
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                일반 사용자는 설정할 필요가 없습니다. 외부 커스텀 서버 연결이 필요한 경우에만 펼쳐보세요.
              </span>
            </div>
            <button
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="glass-button"
              style={{
                background: showAdvancedConfig ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: showAdvancedConfig ? '#38bdf8' : 'rgba(255,255,255,0.15)',
                color: showAdvancedConfig ? '#38bdf8' : '#e2e8f0',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem'
              }}
            >
              {showAdvancedConfig ? '➖ 고급 설정 접기' : '➕ 서버 주소 변경 보기'}
            </button>
          </div>

          {showAdvancedConfig && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                    🚀 외부 신경망 엔진 (KataGo / GTP API) 사용
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    현재 공식 자동 연동이 활성화되어 있습니다.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                />
              </label>

              {config.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span>서버 연결 주소 (REST API 또는 HTTP 중계)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 500 }}>✨ 24시간 공식 서버 자동 연동 중</span>
                    </label>
                    <input
                      type="text"
                      value={config.serverUrl}
                      onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                      placeholder="예: http://211.253.36.117:63333 (기본값)"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '0.4rem' }}>
                      AI 신경망 모델명
                    </label>
                    <input
                      type="text"
                      value={config.modelName}
                      onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                      placeholder="예: kata1-b18c384nbt-s6981484800 (기본: kata-pro-9d)"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <button
                      onClick={handleTestConnection}
                      disabled={testStatus === 'testing'}
                      className="glass-button"
                      style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--accent-blue)' }}
                    >
                      <Wifi size={16} />
                      {testStatus === 'testing' ? '서버 통신 확인 중...' : '서버 연결 및 통신 테스트'}
                    </button>
                  </div>

                  {testMessage && (
                    <div style={{
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : testStatus === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: testStatus === 'success' ? '#10b981' : testStatus === 'failed' ? '#ef4444' : '#fff',
                      border: `1px solid ${testStatus === 'success' ? '#10b981' : testStatus === 'failed' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`
                    }}>
                      {testMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Custom Server Manuals (Collapsible for Power Users) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div>
              <strong style={{ color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={18} color="var(--accent-gold)" /> [고급 옵션] 나만의 커스텀 AI 서버 직접 구축 매뉴얼
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                일반 방문자는 불필요! 내 PC나 클라우드(VPS)에 직접 카타고 서버를 띄우고 싶으신 분만 펼쳐보세요.
              </span>
            </div>
            <button
              onClick={() => setShowManuals(!showManuals)}
              className="glass-button"
              style={{
                background: showManuals ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                borderColor: showManuals ? '#ef4444' : '#fbbf24',
                color: showManuals ? '#ef4444' : '#fbbf24',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem'
              }}
            >
              {showManuals ? '➖ 매뉴얼 접기' : '➕ 직접 구축 가이드 보기'}
            </button>
          </div>

          {showManuals && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {/* Linux / Cloud 24/7 Setup Guide */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.1rem'
              }}>
                <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  🐧 1. 리눅스(VPS/클라우드) 서버 24시간 원클릭 구축 명령어
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 0.6rem 0' }}>
                  Ubuntu, Debian, CentOS, AWS EC2 등의 서버 터미널에서 아래 명령어 한 줄만 입력하시면 Node.js + KataGo + PM2가 무중단 자동 구동됩니다.
                </p>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  marginBottom: '0.5rem'
                }}>
                  curl -sSL https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-linux.sh | bash
                </div>
              </div>

              {/* Windows / Mac PC Local Setup Guide */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.1rem'
              }}>
                <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  💻 2. 내 PC(윈도우/맥) 로컬 카타고 원클릭 실행 가이드
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 0.8rem 0' }}>
                  공식 서버 대신 회원님의 개인 윈도우/맥 컴퓨터의 연산력을 직접 사용하시려면 아래 3단계로 구동하세요.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>1단계: Node.js 설치</strong> — <a href="https://nodejs.org" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>nodejs.org</a>에서 초록색 [LTS 다운로드]를 눌러 설치합니다.<br />
                    <strong>2단계: 실행기 다운로드</strong> — 아래 버튼을 눌러 <code>run-katago-ai.bat</code> 자동 실행기를 다운로드합니다.<br />
                    <strong>3단계: 더블클릭 실행</strong> — 다운로드한 파일을 더블클릭하면 창이 열리며 로컬 PC AI가 구동됩니다.
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <button
                      onClick={handleDownloadBat}
                      className="glass-button"
                      style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', color: '#22c55e', fontWeight: 700, gap: '0.5rem', fontSize: '0.82rem' }}
                    >
                      <Download size={15} /> 📥 윈도우용 원클릭 실행 파일(run-katago-ai.bat) 다운로드
                    </button>
                    <button
                      onClick={handleDownloadMjs}
                      className="glass-button"
                      style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 600, gap: '0.5rem', fontSize: '0.82rem' }}
                    >
                      <ExternalLink size={15} /> 📥 원본 스크립트(setup-katago-auto.mjs) 보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button onClick={onClose} className="glass-button">
            취소
          </button>
          <button onClick={handleSave} className="glass-button primary">
            <CheckCircle2 size={18} /> 설정 저장 및 적용
          </button>
        </div>
      </div>
    </div>
  );
};
