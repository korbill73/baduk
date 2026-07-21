import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessagePayload, PvpMessage } from '../../types/pvp';
import { peerConnectionManager } from '../../core/PeerConnectionManager';
import { UserProfileService } from '../../core/UserProfileService';
import { MessageSquare, Send } from 'lucide-react';
import { soundManager } from '../../sound/SoundManager';

interface OnlineChatPanelProps {
  opponentName: string;
}

export const OnlineChatPanel: React.FC<OnlineChatPanelProps> = ({ opponentName }) => {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([
    {
      id: 'sys-1',
      senderName: '시스템 안내',
      text: `🌐 실시간 P2P 연결이 완료되었습니다! 상대 기사(${opponentName})님과 명승부를 펼쳐보세요.`,
      timestamp: Date.now(),
      isSystem: true
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const myProfile = UserProfileService.getProfile();

  useEffect(() => {
    // Listen to incoming chat messages
    const unsub = peerConnectionManager.onMessage((msg: PvpMessage) => {
      if (msg.type === 'CHAT_MESSAGE' && msg.payload) {
        soundManager.playStoneClick();
        setMessages(prev => [...prev, msg.payload as ChatMessagePayload]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    soundManager.playStoneClick();
    const payload: ChatMessagePayload = {
      id: `chat-${Date.now()}-${Math.random()}`,
      senderName: myProfile.nickname,
      text: inputMsg.trim(),
      timestamp: Date.now()
    };

    // Send P2P
    const sent = peerConnectionManager.sendMessage({
      type: 'CHAT_MESSAGE',
      senderId: myProfile.id,
      payload
    });

    if (sent) {
      setMessages(prev => [...prev, payload]);
      setInputMsg('');
    }
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '320px',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.12)',
        padding: '0.65rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 700,
        color: '#38bdf8',
        fontSize: '0.9rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={16} /> 💬 1:1 실시간 대국 채팅
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>vs {opponentName}</span>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        {messages.map((m) => {
          const isMe = m.senderName === myProfile.nickname && !m.isSystem;
          const timeStr = new Date(m.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

          if (m.isSystem) {
            return (
              <div key={m.id} style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.5rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#fbbf24',
                textAlign: 'center'
              }}>
                {m.text}
              </div>
            );
          }

          return (
            <div key={m.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
              gap: '2px'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {m.senderName} ({timeStr})
              </span>
              <div style={{
                background: isMe ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                padding: '0.55rem 0.85rem',
                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: '0.88rem',
                maxWidth: '85%',
                wordBreak: 'break-word',
                border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} style={{
        display: 'flex',
        gap: '0.4rem',
        padding: '0.6rem',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <input
          type="text"
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          placeholder="채팅 메시지 입력..."
          style={{
            flex: 1,
            padding: '0.55rem 0.8rem',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.88rem'
          }}
        />
        <button
          type="submit"
          className="glass-button"
          style={{
            background: 'var(--accent-blue)',
            color: '#fff',
            padding: '0 0.9rem',
            borderRadius: '6px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
