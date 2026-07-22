import React from 'react';
import { BookOpen, X, Sparkles, Award, CheckCircle2 } from 'lucide-react';

interface AiEngineModalProps {
  onClose: () => void;
}

export const AiEngineModal: React.FC<AiEngineModalProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '580px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <BookOpen size={26} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>바둑 및 KataGo AI 안내</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                세계 최고 수준 딥러닝 인공지능과 함께하는 맞춤형 바둑 도장 가이드
              </p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Status Notice */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.15))',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          fontSize: '0.9rem',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            🎉 24시간 실시간 프로 9단 KataGo AI 구동 중
          </strong>
          <span style={{ color: '#e2e8f0', display: 'block' }}>
            별도의 프로그램 설치나 복잡한 설정 없이 PC, 스마트폰 어디서든 즉시 최고 수준 프로 9단 엔진과 대국 및 복기를 진행할 수 있습니다.<br />
            <em style={{ color: '#38bdf8', display: 'inline-block', marginTop: '0.4rem' }}>💡 상단 [🏆 AI 난이도] 메뉴를 통해 18급부터 9단까지 실력에 맞게 자유롭게 조절해 보세요!</em>
          </span>
        </div>

        {/* Sections */}
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
              <strong>KataGo</strong>는 알파고(AlphaGo Zero)의 논문을 바탕으로 한층 더 진화한 오픈소스 딥러닝 바둑 인공지능입니다. 실시간 승률 변화, 형세 판단, 집 차이 예측 및 4수 앞서보기 코칭을 통해 기력 향상을 돕는 최고의 파트너입니다.
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
              <li><strong>18급 ~ 9단 맞춤 난이도</strong>: 선택된 단급에 맞춰 AI의 탐색 깊이와 수읽기 수준이 차등 적용됩니다.</li>
              <li><strong>단계별 사활 문제은행 (Tsumego)</strong>: 실전 핵심 사활 풀이 및 오답 노트 즉시 확인.</li>
              <li><strong>한국식 / 일본식 실리 계가</strong>: 사석과 공배를 정확히 계산하여 실시간으로 승패를 진단합니다.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={onClose}
            className="glass-button primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: 700, justifyContent: 'center', background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }}
          >
            <CheckCircle2 size={18} /> 확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
