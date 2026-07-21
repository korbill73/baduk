import React, { useState } from 'react';
import { KataGoBridge } from '../../ai/KataGoBridge';
import { Cpu, CheckCircle2, Sparkles, X, Wifi, Terminal, Download, ExternalLink } from 'lucide-react';

interface AiEngineModalProps {
  onClose: () => void;
}

export const AiEngineModal: React.FC<AiEngineModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState(KataGoBridge.getConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

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
            <Cpu size={28} color="var(--accent-blue)" />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>외부 전문 바둑 AI 엔진 연동 센터</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                세계 최고수 딥러닝 인공지능(KataGo, GnuGo, Pachi)을 웹 앱과 직접 연결합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Notice Info Box */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          fontSize: '0.85rem',
          lineHeight: 1.5
        }}>
          <strong style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
            <Sparkles size={16} /> 왜 외부 AI 엔진 연결이 필요한가요?
          </strong>
          <span>
            웹 브라우저 내의 자바스크립트 엔진은 GPU 연산이 불가능하여, 19줄 바둑($10^{170}$ 경우의 수)에서 프로 9단 수준의 신경망 수읽기를 구사하는 데 물리적 한계가 있습니다.
            <strong> 회원님의 요청에 따라 초보 수준도 안 되는 내장 약한 AI 엔진은 전면 제외(폐기)되었습니다!</strong><br />
            이제 모든 AI 대국은 <strong>카타고(KataGo) 프로 9단 엔진 연동 대국</strong>으로만 진행되며, 로컬 PC나 리눅스 서버 연결 시 <strong>세계 최강의 진짜 AI 실력</strong>으로 작동합니다.
          </span>
        </div>

        {/* Linux Server & Remote Cloud 24/7 Guide Box */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          fontSize: '0.85rem',
          lineHeight: 1.5
        }}>
          <strong style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '1rem' }}>
            🐧 리눅스(Linux/VPS) 서버가 있다면 365일 24시간 연동이 가능한가요? (가장 추천!)
          </strong>
          <p style={{ margin: '0 0 0.8rem 0', color: '#e2e8f0' }}>
            <strong>네! 100% 완벽하게 가능하며 현업 최고 서비스 방식입니다.</strong> 회원님께서 리눅스 서버(Ubuntu, Debian, CentOS, AWS EC2, Oracle Cloud 등)를 보유하고 계시다면, 서버 터미널에서 아래 <strong>원클릭 명령어 한 줄</strong>만 실행하세요!
          </p>
          <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontFamily: 'monospace',
            color: '#38bdf8',
            fontSize: '0.82rem',
            wordBreak: 'break-all',
            marginBottom: '0.8rem'
          }}>
            curl -sSL https://raw.githubusercontent.com/korbill73/baduk/main/setup-katago-linux.sh | bash
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            • <strong>자동 구축 효과</strong>: Node.js, KataGo, PM2(무중단 백그라운드 관리자)가 자동 설치되며 365일 24시간 켜져 있습니다.<br />
            • <strong>모바일/PC 접속 방법</strong>: 구축 후 서버 주소(예: <code style={{ color: '#fbbf24' }}>http://리눅스서버IP:63333</code>)를 아래 <strong>[서버 연결 주소]</strong>에 넣고 저장하시면, 스마트폰/태블릿/PC 사용자 누구나 내장 AI 없이 <strong>100% 프로 9단 카타고 연동 대국</strong>이 즉시 진행됩니다!
          </div>
        </div>

        {/* Engine Selection / Toggle */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                🚀 외부 신경망 엔진 (KataGo / GTP API) 활성화
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                비활성화 시 혹은 연결 실패 시 자동으로 내장 고도화 하이브리드 엔진이 안전하게 작동합니다.
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
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '0.4rem' }}>
                  서버 연결 주소 (REST API 또는 HTTP 중계)
                </label>
                <input
                  type="text"
                  value={config.serverUrl}
                  onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                  placeholder="예: http://localhost:63333"
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

        {/* Local Setup Guide & One-Click Downloader for Ordinary Users */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9))',
          border: '1px solid rgba(251, 191, 36, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '1.4rem',
          fontSize: '0.85rem',
          color: '#cbd5e1',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ color: '#fbbf24', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Terminal size={18} color="#fbbf24" /> 👑 일반 방문자용 카타고 9단 AI 원클릭 설치 매뉴얼
            </h4>
            <span style={{ fontSize: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              누구나 1분 완성이 가능한 초간편 가이드
            </span>
          </div>

          <p style={{ color: '#e2e8f0', marginBottom: '1.1rem', lineHeight: 1.5 }}>
            복잡한 명령어 입력이나 프로그램 설치 과정이 필요 없습니다! 아래 <strong>단 3단계</strong>만 따라 하시면 내 윈도우/맥 컴퓨터가 <strong>프로 9단을 이기는 세계 최강 AI 바둑 도장</strong>으로 즉시 변신합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Step 1 */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #38bdf8' }}>
              <strong style={{ color: '#38bdf8', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>
                1단계: Node.js 프로그램 설치 (이미 깔려 있다면 패스!)
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                카타고 엔진 자동 실행을 위해 컴퓨터에 <strong>Node.js</strong>가 필요합니다. 안 깔려 있다면 공식 홈페이지에서 초록색 [LTS 다운로드]를 눌러 10초 만에 설치하세요.
              </span>
              <div style={{ marginTop: '0.6rem' }}>
                <a
                  href="https://nodejs.org"
                  target="_blank"
                  rel="noreferrer"
                  className="glass-button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', borderColor: '#38bdf8', color: '#38bdf8', padding: '0.4rem 0.8rem' }}
                >
                  <span>🔗 Node.js 공식 웹사이트 바로가기</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #22c55e' }}>
              <strong style={{ color: '#22c55e', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>
                2단계: AI 자동 실행 파일 버튼 클릭하여 다운로드
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.7rem' }}>
                아래 버튼을 클릭하시면 <strong>카타고 엔진 및 신경망 가중치 자동 설치기</strong>가 다운로드됩니다.
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <button
                  onClick={handleDownloadBat}
                  className="glass-button"
                  style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', color: '#22c55e', fontWeight: 700, gap: '0.5rem' }}
                >
                  <Download size={16} /> 📥 윈도우용 원클릭 자동 실행 파일(run-katago-ai.bat) 다운로드
                </button>
                <button
                  onClick={handleDownloadMjs}
                  className="glass-button"
                  style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 600, gap: '0.5rem' }}
                >
                  <ExternalLink size={16} /> 📥 맥 / 리눅스 / 원본 스크립트(setup-katago-auto.mjs) 보기
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #fbbf24' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem' }}>
                3단계: 다운로드 받은 파일 더블클릭 실행 ➔ 자동 연동 끝! 🎉
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                다운로드한 <code>run-katago-ai.bat</code> (또는 <code>node setup-katago-auto.mjs</code>) 파일을 더블클릭하면 검은 창이 열리며 AI 신경망을 자동으로 켜줍니다.<br />
                창이 켜진 상태로 이 웹 바둑에 접속만 하시면, 상단 헤더가 <strong>[🟢 AI 자동 연동됨 (최고수)]</strong> 로 빛나면서 프로 9단과의 승부가 바로 시작됩니다!
              </span>
            </div>
          </div>
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
