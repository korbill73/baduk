import React, { useState, useEffect } from 'react';
import type { StoneColor } from '../../types/go';
import type { UserProfile, PvpMessage, ProfileSyncPayload } from '../../types/pvp';
import { peerConnectionManager } from '../../core/PeerConnectionManager';
import { UserProfileService } from '../../core/UserProfileService';
import { Globe, Copy, Check, LogIn, Sparkles, X, AlertCircle, RefreshCw } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface OnlinePvpModalProps {
  onClose: () => void;
  onStartOnlineMatch: (myColor: StoneColor, opponentProfile: UserProfile, roomCode: string) => void;
}

export const OnlinePvpModal: React.FC<OnlinePvpModalProps> = ({
  onClose,
  onStartOnlineMatch,
}) => {
  const [tab, setTab] = useState<'host' | 'join'>('host');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [hostColorChoice, setHostColorChoice] = useState<StoneColor | 'random'>('black');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
  const [assignedColor, setAssignedColor] = useState<StoneColor>('black');

  const myProfile = UserProfileService.getProfile();

  useEffect(() => {
    // Listen to PeerJS connection status
    const unsubStatus = peerConnectionManager.onStatusChange((s, err) => {
      setStatus(s);
      if (err) setErrorMsg(err);
      else setErrorMsg(null);
    });

    // Listen to incoming P2P messages inside lobby
    const unsubMsg = peerConnectionManager.onMessage((msg: PvpMessage) => {
      if (msg.type === 'PROFILE_SYNC') {
        const payload: ProfileSyncPayload = msg.payload;
        setOpponentProfile(payload.profile);
        setAssignedColor(payload.assignedColor);
        soundManager.playVictory();

        // If we are Host and we received their profile, send our PROFILE_SYNC & GAME_START
        if (peerConnectionManager.getStatus().isHost) {
          let myFinalColor: StoneColor = 'black';
          if (hostColorChoice === 'random') {
            myFinalColor = Math.random() > 0.5 ? 'black' : 'white';
          } else {
            myFinalColor = hostColorChoice;
          }
          const guestColor: StoneColor = myFinalColor === 'black' ? 'white' : 'black';

          const syncMsg: PvpMessage = {
            type: 'PROFILE_SYNC',
            senderId: myProfile.id,
            payload: {
              profile: myProfile,
              assignedColor: guestColor,
              komi: 6.5,
            } as ProfileSyncPayload
          };
          peerConnectionManager.sendMessage(syncMsg);

          const startMsg: PvpMessage = {
            type: 'GAME_START',
            senderId: myProfile.id
          };
          setTimeout(() => {
            peerConnectionManager.sendMessage(startMsg);
            onStartOnlineMatch(myFinalColor, payload.profile, roomCode || 'ROOM');
          }, 600);
        }
      } else if (msg.type === 'GAME_START') {
        // Guest receives GAME_START from Host
        if (!peerConnectionManager.getStatus().isHost && opponentProfile) {
          onStartOnlineMatch(assignedColor, opponentProfile, joinCodeInput.toUpperCase());
        }
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
    };
  }, [hostColorChoice, myProfile, opponentProfile, assignedColor, roomCode, joinCodeInput, onStartOnlineMatch]);

  const handleHostRoom = async () => {
    soundManager.playStoneClick();
    setErrorMsg(null);
    try {
      const code = await peerConnectionManager.createRoom();
      setRoomCode(code);
    } catch (e: any) {
      setErrorMsg(e.message || '방 생성 실패');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) {
      setErrorMsg('초대 코드를 입력해주세요.');
      return;
    }
    soundManager.playStoneClick();
    setErrorMsg(null);
    try {
      const success = await peerConnectionManager.joinRoom(joinCodeInput.trim());
      if (success) {
        // We are guest, send our profile to Host
        const syncMsg: PvpMessage = {
          type: 'PROFILE_SYNC',
          senderId: myProfile.id,
          payload: {
            profile: myProfile,
            assignedColor: 'white', // Placeholder, Host decides final color
            komi: 6.5,
          } as ProfileSyncPayload
        };
        peerConnectionManager.sendMessage(syncMsg);
      }
    } catch (e: any) {
      setErrorMsg('접속 실패: 코드를 확인해주세요.');
    }
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    soundManager.playStoneClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.84)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '620px',
        padding: '1.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid #38bdf8',
        boxShadow: '0 0 35px rgba(56, 189, 248, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>🌐 실시간 1:1 온라인 바둑 (P2P)</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>초대 코드를 공유하여 전 세계 어디서든 친구와 실시간 대국을 펼칩니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => { soundManager.playStoneClick(); setTab('host'); }}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '6px',
              border: 'none',
              background: tab === 'host' ? '#38bdf8' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={18} /> 내 초대 코드 방 만들기
          </button>
          <button
            onClick={() => { soundManager.playStoneClick(); setTab('join'); }}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '6px',
              border: 'none',
              background: tab === 'join' ? '#a855f7' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={18} /> 친구 초대 코드로 접속
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', padding: '0.8rem', borderRadius: '8px', color: '#fecdd3', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#f43f5e" /> {errorMsg}
          </div>
        )}

        {/* Tab 1: Host Room */}
        {tab === 'host' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Color Selection Option */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>☯️ 방장(나)의 돌 색상 선택</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setHostColorChoice('black')}
                  className="glass-button"
                  style={{ flex: 1, justifyContent: 'center', background: hostColorChoice === 'black' ? '#1e293b' : 'transparent', borderColor: hostColorChoice === 'black' ? '#38bdf8' : 'rgba(255,255,255,0.2)', fontWeight: 600 }}
                >
                  ⚫ 흑돌 (선수)
                </button>
                <button
                  onClick={() => setHostColorChoice('white')}
                  className="glass-button"
                  style={{ flex: 1, justifyContent: 'center', background: hostColorChoice === 'white' ? '#f8fafc' : 'transparent', color: hostColorChoice === 'white' ? '#0f172a' : '#fff', borderColor: hostColorChoice === 'white' ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 600 }}
                >
                  ⚪ 백돌 (후수 +덤 6.5집)
                </button>
                <button
                  onClick={() => setHostColorChoice('random')}
                  className="glass-button"
                  style={{ flex: 1, justifyContent: 'center', background: hostColorChoice === 'random' ? '#f59e0b' : 'transparent', borderColor: hostColorChoice === 'random' ? '#fbbf24' : 'rgba(255,255,255,0.2)', color: hostColorChoice === 'random' ? '#000' : '#fff', fontWeight: 600 }}
                >
                  🎲 무작위 랜덤
                </button>
              </div>
            </div>

            {!roomCode && status !== 'connecting' ? (
              <button
                onClick={handleHostRoom}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem'
                }}
              >
                <Sparkles size={22} /> 6자리 초대 코드 발급 및 대기방 생성
              </button>
            ) : status === 'connecting' && !roomCode ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#38bdf8', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                <RefreshCw size={28} className="animate-spin" /> P2P 시그널링 서버에 방을 등록하는 중입니다...
              </div>
            ) : (
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '2px dashed #38bdf8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>✅ 방이 개설되었습니다! 아래 코드를 복사하여 친구에게 카톡으로 보내주세요:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#0f172a', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '3px', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="glass-button"
                    style={{ padding: '0.5rem 0.8rem', background: copied ? '#10b981' : 'var(--accent-blue)', color: '#fff' }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? '복사됨!' : '코드 복사'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  <RefreshCw size={18} className="animate-spin" /> 친구의 접속 및 프로필 수신을 기다리고 있습니다...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Join Room */}
        {tab === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>친구에게 받은 6자리 초대 코드 입력</label>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="예: BD-7812"
                  maxLength={10}
                  style={{
                    flex: 1,
                    padding: '0.8rem 1rem',
                    background: '#0f172a',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={status === 'connecting'}
                  style={{
                    padding: '0 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                    color: '#fff',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: status === 'connecting' ? 0.6 : 1
                  }}
                >
                  <LogIn size={20} /> 접속하기
                </button>
              </div>
            </div>

            {status === 'connecting' && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#a855f7', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                <RefreshCw size={22} className="animate-spin" /> 방에 접속하여 프로필 및 대국 정보를 수신하고 있습니다...
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>💡 내 기사 ID: <strong style={{ color: '#fff' }}>{myProfile.nickname} ({myProfile.rankTitle})</strong></span>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.4rem 1rem' }}>취소</button>
        </div>
      </div>
    </div>
  );
};
