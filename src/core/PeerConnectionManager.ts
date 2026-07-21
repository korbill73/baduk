import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { PvpMessage } from '../types/pvp';

type MessageHandler = (message: PvpMessage) => void;
type StatusChangeHandler = (status: 'disconnected' | 'connecting' | 'connected' | 'error', errorMsg?: string) => void;

export class PeerConnectionManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private messageListeners: Set<MessageHandler> = new Set();
  private statusListeners: Set<StatusChangeHandler> = new Set();
  private isHost: boolean = false;
  private currentRoomCode: string | null = null;

  constructor() {}

  public getStatus(): { isHost: boolean; roomCode: string | null; isConnected: boolean } {
    return {
      isHost: this.isHost,
      roomCode: this.currentRoomCode,
      isConnected: !!(this.conn && this.conn.open)
    };
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageListeners.add(handler);
    return () => this.messageListeners.delete(handler);
  }

  public onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusListeners.add(handler);
    return () => this.statusListeners.delete(handler);
  }

  private notifyStatus(status: 'disconnected' | 'connecting' | 'connected' | 'error', errorMsg?: string) {
    this.statusListeners.forEach(h => h(status, errorMsg));
  }

  private notifyMessage(msg: PvpMessage) {
    this.messageListeners.forEach(h => h(msg));
  }

  public async createRoom(): Promise<string> {
    this.disconnect();
    this.isHost = true;
    this.notifyStatus('connecting');

    // Generate readable 6-character room code like BD-7812
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const roomCode = `BD-${randomNum}`;
    const peerId = `baduk-pvp-v1-${roomCode}`;
    this.currentRoomCode = roomCode;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          console.log('Peer room hosted with ID:', id);
          resolve(roomCode);
        });

        this.peer.on('connection', (connection) => {
          console.log('Guest connected:', connection.peer);
          if (this.conn) {
            // Already connected to someone, reject new connection
            connection.close();
            return;
          }
          this.setupConnection(connection);
        });

        this.peer.on('error', (err) => {
          console.error('Peer error:', err);
          this.notifyStatus('error', err.message || '방 생성 중 오류가 발생했습니다.');
          reject(err);
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message);
        reject(e);
      }
    });
  }

  public async joinRoom(roomCode: string): Promise<boolean> {
    this.disconnect();
    this.isHost = false;
    this.currentRoomCode = roomCode.trim().toUpperCase();
    this.notifyStatus('connecting');

    const targetPeerId = `baduk-pvp-v1-${this.currentRoomCode}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          debug: 1
        });

        this.peer.on('open', () => {
          if (!this.peer) return;
          const connection = this.peer.connect(targetPeerId, {
            reliable: true
          });
          this.setupConnection(connection);
          
          connection.on('open', () => {
            resolve(true);
          });
        });

        this.peer.on('error', (err) => {
          console.error('Peer error:', err);
          this.notifyStatus('error', '존재하지 않거나 접속할 수 없는 방 코드입니다. 코드를 확인해주세요.');
          reject(err);
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message);
        reject(e);
      }
    });
  }

  private setupConnection(connection: DataConnection) {
    this.conn = connection;

    this.conn.on('open', () => {
      console.log('DataConnection opened!');
      this.notifyStatus('connected');
    });

    this.conn.on('data', (data: any) => {
      try {
        if (data && typeof data === 'object' && data.type) {
          this.notifyMessage(data as PvpMessage);
        }
      } catch (e) {
        console.error('Error handling incoming PvpMessage:', e);
      }
    });

    this.conn.on('close', () => {
      console.log('DataConnection closed');
      this.conn = null;
      this.notifyStatus('disconnected', '상대방과의 연결이 끊어졌습니다.');
    });

    this.conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.notifyStatus('error', '통신 중 오류가 발생했습니다.');
    });
  }

  public sendMessage(msg: PvpMessage): boolean {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
      return true;
    }
    return false;
  }

  public disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.currentRoomCode = null;
    this.isHost = false;
  }
}

export const peerConnectionManager = new PeerConnectionManager();
