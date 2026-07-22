import React, { useState, useEffect } from 'react';
import { firebaseBridge } from '../../core/FirebaseService';
import { X, Users, Trophy, Activity, ShieldCheck, RefreshCw, Search } from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'games'>('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const uList = await firebaseBridge.getAdminAllUsers();
      const gList = await firebaseBridge.getAdminRecentGames();
      setUsers(uList);
      setGames(gList);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalWins = users.reduce((acc, u) => acc + (u.stats?.vsAiWins || 0) + (u.stats?.onlineWins || 0), 0);
  const totalLosses = users.reduce((acc, u) => acc + (u.stats?.vsAiLosses || 0) + (u.stats?.onlineLosses || 0), 0);

  const filteredUsers = users.filter(u => 
    (u.nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1.2rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
        border: '1px solid #fbbf24',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}>
              <ShieldCheck size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👑 관리자 전용 대시보드
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                회원 현황, 기보 기록 및 실시간 접속 통계 분석
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={fetchData}
              disabled={loading}
              className="glass-button"
              style={{ padding: '0.5rem 0.8rem', gap: '0.4rem', fontSize: '0.82rem' }}
              title="데이터 새로고침"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> 새로고침
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem 1.75rem',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={32} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>총 가입 회원수</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{users.length} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>명</span></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Trophy size={32} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>누적 클라우드 기보수</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{games.length} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>판</span></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Activity size={32} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>전체 승패 비율</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                {totalWins}승 / {totalLosses}패
              </div>
            </div>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div style={{
          padding: '0 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'users' ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'users' ? '#000' : '#e2e8f0',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              👥 회원 목록 (`{users.length}`)
            </button>
            <button
              onClick={() => setActiveTab('games')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'games' ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'games' ? '#000' : '#e2e8f0',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              📜 최근 대국 기록 (`{games.length}`)
            </button>
          </div>

          {activeTab === 'users' && (
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="닉네임/이메일 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.8rem 0.45rem 2.1rem',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.75rem 1.5rem 1.75rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={36} style={{ margin: '0 auto 1rem auto' }} />
              <p>클라우드 데이터를 불러오는 중입니다...</p>
            </div>
          ) : activeTab === 'users' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>닉네임</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>이메일</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>현재 단급</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>AI 대국 전적</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>온라인 전적</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>권한</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        조회된 회원 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#fff' }}>{u.nickname || '기사'}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email || '-'}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {u.rankTitle || '18급'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#10b981', fontWeight: 600 }}>
                          {u.stats?.vsAiWins || 0}승 {u.stats?.vsAiLosses || 0}패
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#c084fc', fontWeight: 600 }}>
                          {u.stats?.onlineWins || 0}승 {u.stats?.onlineLosses || 0}패
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          {u.role === 'admin' || u.isAdmin ? (
                            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                              👑 관리자
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>일반 기사</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>대국 모드</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>결과</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>상대방 / AI 난이도</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>흑백 선택</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>일시</th>
                  </tr>
                </thead>
                <tbody>
                  {games.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        저장된 대국 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    games.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                          {g.mode === 'play' && '🤖 AI 대국'}
                          {g.mode === 'pvp' && '👥 1:1 로컬'}
                          {g.mode === 'online' && '🌐 온라인'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{
                            color: g.result === 'win' ? '#10b981' : '#ef4444',
                            fontWeight: 700,
                            background: g.result === 'win' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {g.result === 'win' ? '승리' : '패배'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#e2e8f0' }}>
                          {g.aiRankName ? `KataGo (${g.aiRankName})` : g.opponent || '상대방'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                          {g.playerColor === 'black' ? '⚫ 흑 (Black)' : '⚪ 백 (White)'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {g.playedAt ? new Date(g.playedAt.toDate ? g.playedAt.toDate() : g.playedAt).toLocaleString('ko-KR') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
