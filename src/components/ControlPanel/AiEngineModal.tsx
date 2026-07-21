import React, { useState } from 'react';
import { KataGoBridge } from '../../ai/KataGoBridge';
import { Cpu, CheckCircle2, Sparkles, X, Wifi, Terminal } from 'lucide-react';

interface AiEngineModalProps {
  onClose: () => void;
}

export const AiEngineModal: React.FC<AiEngineModalProps> = ({ onClose }) => {
  const [config, setConfig] = useState(KataGoBridge.getConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

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
            <strong> 카타고(KataGo)</strong> 등 실제 세계 최강 오픈소스 바둑 엔진을 로컬 PC(`http://localhost:63333`)나 클라우드 서버에 띄워 연동하시면,
            <strong> 단 0.05초 만에 세계대회 우승 프로 9단을 압도하는 진짜 AI 실력</strong>으로 대국을 펼칠 수 있습니다!
          </span>
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

        {/* Local Setup Guide */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Terminal size={16} color="var(--accent-gold)" /> 로컬 PC에서 KataGo 실행 가이드 (간편 3단계)
          </h4>
          <ol style={{ paddingLeft: '1.2rem', lineHeight: 1.6 }}>
            <li>KataGo 공식 깃허브나 Lizzie / Sabaki 프로그램 폴더에서 <code>katago.exe</code>를 실행합니다.</li>
            <li>터미널에서 <code>katago gtp -model g170e-b20c256x2-s5303129600-d122840192.bin.gz -config gtp_custom.cfg</code> 형태로 실행합니다.</li>
            <li>WebSocket 또는 SGF 중계 서버를 포트 <code>63333</code>에 개방하면 웹 앱이 자동으로 연결하여 프로 9단 실력을 발휘합니다!</li>
          </ol>
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
