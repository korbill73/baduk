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
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && targetUrl.includes('211.253.36.117:63333')) {
        targetUrl = '/api/katago';
      } else {
        if (targetUrl.startsWith('ws://')) targetUrl = targetUrl.replace('ws://', 'http://');
        if (targetUrl.startsWith('wss://')) targetUrl = targetUrl.replace('wss://', 'https://');
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
          targetUrl = 'http://' + targetUrl;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6초 충분한 타임아웃
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
        if (targetUrl !== 'http://211.253.36.117:63333' && targetUrl !== '/api/katago') {
          console.warn(`⏳ ${targetUrl} 응답 없음 -> 공식 KT Cloud 서버로 자동 전환합니다.`);
          this.config.serverUrl = 'http://211.253.36.117:63333';
          this.config.enabled = true;
          try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
          this.notifyListeners();
          return this.checkAndSyncConnection();
        }
        // 일시적인 지연 시 localStorage에서 완전히 비활성화하지 않고 메모리 상태만 조정
        return false;
      }
    } catch (e) {
      if (this.config.serverUrl !== 'http://211.253.36.117:63333' && this.config.serverUrl !== '/api/katago') {
        this.config.serverUrl = 'http://211.253.36.117:63333';
        this.config.enabled = true;
        try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
        this.notifyListeners();
        return this.checkAndSyncConnection();
      }
      return false;
    }
  }

  // Convert board moves history into SGF or GTP coordinates (e.g. D4, Q16)
  static pointToGtp(point: Point, boardSize: number = 19): string {
    const letters = 'ABCDEFGHJKLMNOPQRST';
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
    forceTest: boolean = false,
    rankInfo?: any,
    grid?: StoneColor[][]
  ): Promise<{ move: Point | null; recommendations: AiRecommendation[]; isExternal: boolean } | null> {
    if (!aiColor) {
      return null;
    }

    try {
      const movesFormatted = historyMoves
        .filter(m => !m.isPass && !m.isResign)
        .map(m => [m.color === 'black' ? 'B' : 'W', this.pointToGtp({ x: m.x, y: m.y }, boardSize)]);

      let visits = 120;
      if (rankInfo) {
        const idStr = (rankInfo.id || '').toLowerCase();
        const nameStr = (rankInfo.name || '').toLowerCase();
        if (idStr.includes('18k') || nameStr.includes('18급')) visits = 1;
        else if (idStr.includes('15k') || nameStr.includes('15급')) visits = 2;
        else if (idStr.includes('12k') || nameStr.includes('12급')) visits = 5;
        else if (idStr.includes('10k') || nameStr.includes('10급')) visits = 10;
        else if (idStr.includes('8k') || nameStr.includes('8급')) visits = 18;
        else if (idStr.includes('6k') || nameStr.includes('6급')) visits = 30;
        else if (idStr.includes('4k') || nameStr.includes('4급')) visits = 45;
        else if (idStr.includes('2k') || nameStr.includes('2급')) visits = 65;
        else if (idStr.includes('1d') || nameStr.includes('1단')) visits = 90;
        else if (idStr.includes('3d') || nameStr.includes('3단')) visits = 130;
        else if (idStr.includes('5d') || nameStr.includes('5단')) visits = 180;
        else if (idStr.includes('7d') || nameStr.includes('7단')) visits = 230;
        else if (idStr.includes('9d') || nameStr.includes('9단') || idStr.includes('pro')) visits = 300;
      }

      const queryPayload = {
        id: `query-${Date.now()}`,
        initialStones: [],
        moves: movesFormatted,
        rules: 'korean',
        komi: 6.5,
        boardXSize: boardSize,
        boardYSize: boardSize,
        maxVisits: visits
      };

      let targetUrl = (this.config.serverUrl || 'http://211.253.36.117:63333').trim().replace(/\/$/, '');
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && targetUrl.includes('211.253.36.117:63333')) {
        targetUrl = '/api/katago';
      } else {
        if (targetUrl.startsWith('ws://')) {
          targetUrl = targetUrl.replace('ws://', 'http://');
        } else if (targetUrl.startsWith('wss://')) {
          targetUrl = targetUrl.replace('wss://', 'https://');
        }
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
          targetUrl = 'http://' + targetUrl;
        }
      }

      // 만약 enabled가 false이더라도 공식 서버이거나 프록시 경로라면 쿼리를 항상 시도
      if (!this.config.enabled && !forceTest && targetUrl !== '/api/katago' && targetUrl !== 'http://211.253.36.117:63333') {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20초 최대 타임아웃
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
        if (!this.config.enabled) {
          this.config.enabled = true;
          try { localStorage.setItem('baduk-katago-config', JSON.stringify(this.config)); } catch (e) {}
        }
        return this.parseKataGoResponse(data, boardSize, grid);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (forceTest && !err.name?.includes('AbortError')) {
          console.warn('[KataGo 통신 오류, 내장 AI로 전환]:', err.message);
        }
        return null;
      }
    } catch (err: any) {
      return null;
    }
  }

  private static parseKataGoResponse(data: any, boardSize: number, grid?: StoneColor[][]): { move: Point | null; recommendations: AiRecommendation[]; isExternal: boolean } {
    if (!data || !data.moveInfos || data.moveInfos.length === 0) {
      return { move: null, recommendations: [], isExternal: true };
    }

    let bestPoint: Point | null = null;
    for (const info of data.moveInfos) {
      const pt = this.gtpToPoint(info.move, boardSize);
      if (pt) {
        // 만약 해당 위치에 이미 돌이 놓여져 있다면 중복 착수이므로 다음 추천수를 선택
        if (grid && grid[pt.y] && grid[pt.y][pt.x] !== null) {
          continue;
        }
        bestPoint = pt;
        break;
      }
    }

    if (!bestPoint) {
      return { move: null, recommendations: [], isExternal: true };
    }

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
