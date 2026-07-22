import React, { useState } from 'react';
import type { UserProfile, GameRecordEntry } from '../../types/pvp';
import { UserProfileService } from '../../core/UserProfileService';
import { User, X, Save, Edit3, Shield, Swords, LogOut } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface UserProfileModalProps {
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onClose,
  onProfileUpdated,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => UserProfileService.getProfile());
  const [history] = useState<GameRecordEntry[]>(() => UserProfileService.getHistory());
  const [nickname, setNickname] = useState(profile.nickname);
  const [rankTitle, setRankTitle] = useState(profile.rankTitle);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    soundManager.playStoneClick();
    const updated = UserProfileService.updateNickname(nickname, rankTitle);
    setProfile(updated);
    setIsEditing(false);
    onProfileUpdated(updated);
  };

  const totalWins = profile.stats.vsAiWins + profile.stats.onlineWins + profile.stats.pvpWins;
  const totalLosses = profile.stats.vsAiLosses + profile.stats.onlineLosses + profile.stats.pvpLosses;
  const totalGames = totalWins + totalLosses;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '1.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid var(--accent-blue)',
        boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
            }}>
              <User size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>나의 기사 ID 및 전적 기록부</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>고유 ID 번호와 닉네임을 설정하고 온/오프라인 통계 및 전적을 확인합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* ID & Profile Editing Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="#38bdf8" /> 고유 기사 등록 ID (클라우드 접속용 식별자)
              </span>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {profile.id}
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="glass-button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', gap: '0.4rem' }}
              >
                <Edit3 size={16} /> 프로필 변경
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="glass-button"
                style={{ background: 'var(--accent-blue)', color: '#fff', fontWeight: 600, padding: '0.5rem 1rem', fontSize: '0.88rem', gap: '0.4rem' }}
              >
                <Save size={16} /> 저장 완료
              </button>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>대국 닉네임 / 기사명</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                  placeholder="예: 바둑지존9단"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>목표/보유 단급 명칭</label>
                <select
                  value={rankTitle}
                  onChange={e => setRankTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="아마 10급">아마 10급 ~ 6급</option>
                  <option value="아마 5급">아마 5급 ~ 1급</option>
                  <option value="아마 1단">아마 1단 ~ 3단</option>
                  <option value="아마 4단">아마 4단 ~ 6단</option>
                  <option value="아마 7단">아마 7단 (도장 사범)</option>
                  <option value="프로 9단">프로 9단 (AI 신계 명인)</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>기사명 (Nickname):</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginLeft: '8px' }}>{profile.nickname}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>단급:</span>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  marginLeft: '8px'
                }}>
                  {profile.rankTitle}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>총 대국 전적 (Total)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {totalWins}승 {totalLosses}패
            </div>
            <span style={{ fontSize: '0.78rem', color: winRate >= 50 ? '#38bdf8' : '#f43f5e' }}>승률 {winRate}%</span>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>🌐 온라인 1:1 (P2P)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {profile.stats.onlineWins}승 {profile.stats.onlineLosses}패
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>친구 초대 대국 전적</span>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>🤖 vs AI 인공지능</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {profile.stats.vsAiWins}승 {profile.stats.vsAiLosses}패
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AI 도장 수련 전적</span>
          </div>
        </div>

        {/* Recent Battle History Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Swords size={18} color="var(--accent-gold)" /> 최근 대국 전적 기록 (최대 50경기)
          </h3>

          {history.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              아직 기록된 대국 전적이 없습니다. 대국을 완주하고 계가를 확정하면 전적이 등록됩니다!
            </div>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
              {history.map((h) => (
                <div key={h.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  borderLeft: h.result === 'win' ? '4px solid #38bdf8' : h.result === 'loss' ? '4px solid #f43f5e' : '4px solid #94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{
                      fontWeight: 700,
                      color: h.result === 'win' ? '#38bdf8' : h.result === 'loss' ? '#f43f5e' : '#cbd5e1'
                    }}>
                      {h.result === 'win' ? '승리 (WIN)' : h.result === 'loss' ? '패배 (LOSS)' : '무승부'}
                    </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>vs {h.opponent}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      {h.mode === 'online' ? '🌐 온라인 P2P' : h.mode === 'pvp' ? '👥 로컬 1:1' : '🤖 AI 대국'} ({h.playerColor === 'black' ? '흑' : '백'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {h.scoreDiff !== undefined && (
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>{h.scoreDiff}집 차</span>
                    )}
                    <span>{h.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div>
            {onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('바둑 마스터클래스 계정에서 로그아웃 하시겠습니까?')) {
                    onLogout();
                    onClose();
                  }
                }}
                className="glass-button"
                style={{
                  borderColor: 'rgba(244, 63, 94, 0.6)',
                  background: 'rgba(244, 63, 94, 0.18)',
                  color: '#fda4af',
                  fontWeight: 700,
                  padding: '0.6rem 1.2rem',
                  gap: '0.45rem'
                }}
              >
                <LogOut size={18} />
                <span>계정 안전 로그아웃</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="glass-button"
            style={{ padding: '0.6rem 1.4rem', fontWeight: 600 }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
