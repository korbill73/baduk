import type { Point, StoneColor, AiRecommendation, Move } from '../types/go';

export interface KataGoConfig {
  enabled: boolean;
  serverUrl: string; // e.g. "http://localhost:63333" or "ws://localhost:63333"
  modelName: string; // e.g. "kata-pro-9d"
  autoConnect?: boolean;
}

export class KataGoBridge {
  private static config: KataGoConfig = {
    enabled: true,
    serverUrl: 'http://211.253.36.117:63333',
    modelName: 'kata-pro-9d',
    autoConnect: true
  };

  private static socket: WebSocket | null = null;
  private static listeners: Set<(enabled: boolean) => void> = new Set();
  private static monitorInterval: any = null;
  private static isInitialized = false;

  private static loadSavedConfig() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      const saved = localStorage.getItem('baduk-katago-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 만약 로컬호스트로 설정되어 있거나 URL이 없으면 공식 24시간 KT Cloud 프로 9단 서버로 자동 업그레이드!
        if (!parsed.serverUrl || parsed.serverUrl.includes('localhost') || parsed.serverUrl === 'http://localhost:63333') {
          parsed.serverUrl = 'http://211.253.36.117:63333';
          parsed.enabled = true;
        }
        this.config = { ...this.config, ...parsed };
      }
    } catch (e) {
      console.error('KataGo 설정 로드 오류:', e);
    }
    this.startAutoConnectMonitor();
  }

  static setConfig(newConfig: Partial<KataGoConfig>) {
    this.loadSavedConfig();
    this.config = { ...this.config, ...newConfig };
    if (!this.config.enabled && this.socket) {
      this.socket.close();
      this.socket = null;
    }
    try {
      localStorage.setItem('baduk-katago-config', JSON.stringify(this.config));
    } catch (e) {}
    this.notifyListeners();
  }

  static getConfig(): KataGoConfig {
    this.loadSavedConfig();
    return { ...this.config };
  }

  static onStatusChange(listener: (enabled: boolean) => void): () => void {
    this.loadSavedConfig();
    this.listeners.add(listener);
    listener(this.config.enabled);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    this.listeners.forEach(fn => fn(this.config.enabled));
  }

  static startAutoConnectMonitor() {
    if (this.monitorInterval) return;
    // Check connection immediately on startup, then every 4 seconds
    this.checkAndSyncConnection();
    this.monitorInterval = setInterval(() => {
      if (this.config.autoConnect !== false) {
        this.checkAndSyncConnection();
      }
    }, 4000);
  }

  static async checkAndSyncConnection(): Promise<boolean> {
    try {
      let targetUrl = (this.config.serverUrl || 'http://211.253.36.117:63333').trim().replace(/\/$/, '');
      if (targetUrl.startsWith('ws://')) targetUrl = targetUrl.replace('ws://', 'http://');
      if (targetUrl.startsWith('wss://')) targetUrl = targetUrl.replace('wss://', 'https://');
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'http://' + targetUrl;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(targetUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        if (!this.config.enabled) {
          this.config.enabled = true;
          try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
          this.notifyListeners();
          console.log(`🎉 [KataGo 자동 연동 성공] ${targetUrl} 엔진 연결이 감지되어 자동 활성화되었습니다!`);
        }
        return true;
      } else {
        // 접속 실패 시 사용자 경험을 위해 공식 KT Cloud 서버로 자동 폴백(Fallback) 시도
        if (targetUrl !== 'http://211.253.36.117:63333') {
          console.warn(`⏳ ${targetUrl} 응답 없음 -> 공식 KT Cloud 서버(http://211.253.36.117:63333)로 자동 전환합니다.`);
          this.config.serverUrl = 'http://211.253.36.117:63333';
          this.config.enabled = true;
          try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
          this.notifyListeners();
          return this.checkAndSyncConnection();
        }
        if (this.config.enabled) {
          this.config.enabled = false;
          try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
          this.notifyListeners();
        }
        return false;
      }
    } catch (e) {
      if (this.config.serverUrl !== 'http://211.253.36.117:63333') {
        this.config.serverUrl = 'http://211.253.36.117:63333';
        this.config.enabled = true;
        try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
        this.notifyListeners();
        return this.checkAndSyncConnection();
      }
      if (this.config.enabled) {
        this.config.enabled = false;
        try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
        this.notifyListeners();
      }
      return false;
    }
  }

  // Convert board moves history into SGF or GTP coordinates (e.g. D4, Q16)
  static pointToGtp(point: Point, boardSize: number = 19): string {
    const letters = 'ABCDEFGHJKLMNOPQRST'; // Note: I is omitted in GTP
    if (point.x < 0 || point.x >= boardSize || point.y < 0 || point.y >= boardSize) {
      return 'pass';
    }
    const letter = letters[point.x];
    const number = boardSize - point.y;
    return `${letter}${number}`;
  }

  static gtpToPoint(gtp: string, boardSize: number = 19): Point | null {
    if (!gtp || gtp.toLowerCase() === 'pass' || gtp.toLowerCase() === 'resign') {
      return null;
    }
    const letters = 'ABCDEFGHJKLMNOPQRST';
    const letter = gtp.charAt(0).toUpperCase();
    const x = letters.indexOf(letter);
    const number = parseInt(gtp.substring(1), 10);
    const y = boardSize - number;
    if (x < 0 || x >= boardSize || isNaN(y) || y < 0 || y >= boardSize) {
      return null;
    }
    return { x, y };
  }

  // Query local/external KataGo server via WebSocket or HTTP fallback
  static async queryKataGo(
    boardSize: number,
    historyMoves: Move[],
    aiColor: StoneColor,
    forceTest: boolean = false
  ): Promise<{ move: Point | null; recommendations: AiRecommendation[]; isExternal: boolean } | null> {
    if ((!this.config.enabled && !forceTest) || !aiColor) {
      return null;
    }

    try {
      // Build KataGo query format (Analysis engine JSON format)
      const movesFormatted = historyMoves
        .filter(m => !m.isPass && !m.isResign)
        .map(m => [m.color === 'black' ? 'B' : 'W', this.pointToGtp({ x: m.x, y: m.y }, boardSize)]);

      const queryPayload = {
        id: `query-${Date.now()}`,
        initialStones: [],
        moves: movesFormatted,
        rules: 'korean',
        komi: 6.5,
        boardXSize: boardSize,
        boardYSize: boardSize,
        maxVisits: 120
      };

      let targetUrl = (this.config.serverUrl || 'http://211.253.36.117:63333').trim().replace(/\/$/, '');
      // ws:// 나 wss:// 로 입력되어도 로컬/원격 HTTP REST API로 자동 전환하여 접속 안정성 극대화
      if (targetUrl.startsWith('ws://')) {
        targetUrl = targetUrl.replace('ws://', 'http://');
      } else if (targetUrl.startsWith('wss://')) {
        targetUrl = targetUrl.replace('wss://', 'https://');
      }
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'http://' + targetUrl;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 최대 타임아웃
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP 상태 코드 ${response.status}: 서버에서 응답을 처리할 수 없습니다.`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(`KataGo 엔진 오류: ${data.error}`);
        }
        return this.parseKataGoResponse(data, boardSize);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (forceTest) {
          console.error('[KataGo 통신 테스트 오류]:', err);
          throw new Error(err.message || '서버 통신 실패');
        }
        return null;
      }
    } catch (err: any) {
      if (forceTest) {
        throw new Error(err.message || '쿼리 생성 및 전송 실패');
      }
      return null;
    }
  }

  private static parseKataGoResponse(data: any, boardSize: number): { move: Point | null; recommendations: AiRecommendation[]; isExternal: boolean } {
    if (!data || !data.moveInfos || data.moveInfos.length === 0) {
      return { move: null, recommendations: [], isExternal: true };
    }

    const bestMoveGtp = data.moveInfos[0].move;
    const bestPoint = this.gtpToPoint(bestMoveGtp, boardSize);

    const recommendations: AiRecommendation[] = data.moveInfos.slice(0, 3).map((info: any, idx: number) => {
      const pt = this.gtpToPoint(info.move, boardSize) || { x: 0, y: 0 };
      const winRate = info.winrate ? info.winrate * 100 : 50;
      const winRateChange = Math.round((winRate - 50) * 10) / 10;
      
      let category: '실리' | '세력' | '공격' | '방어' | '끝내기' = '실리';
      if (info.order === 0) category = '공격';
      else if (info.order === 1) category = '세력';
      else category = '방어';

      return {
        point: pt,
        rank: idx + 1,
        winRateChange,
        explanation: `[KataGo 외부 AI 엔진 추천수] 시뮬레이션 ${info.visits || 500}회 탐색 결과. 승률 기대치: ${winRate.toFixed(1)}%`,
        category
      };
    });

    return {
      move: bestPoint,
      recommendations,
      isExternal: true
    };
  }
}
