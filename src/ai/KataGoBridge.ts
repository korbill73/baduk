import type { Point, StoneColor, AiRecommendation, Move } from '../types/go';

export interface KataGoConfig {
  enabled: boolean;
  serverUrl: string; // e.g. "ws://localhost:63333" or REST API endpoint
  modelName: string; // e.g. "kata1-b18c384nbt-s6981484800"
}

export class KataGoBridge {
  private static config: KataGoConfig = {
    enabled: false,
    serverUrl: 'http://localhost:63333',
    modelName: 'kata-pro-9d'
  };

  private static socket: WebSocket | null = null;

  static setConfig(newConfig: Partial<KataGoConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (!this.config.enabled && this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  static getConfig(): KataGoConfig {
    return { ...this.config };
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

      let targetUrl = (this.config.serverUrl || 'http://localhost:63333').trim().replace(/\/$/, '');
      // ws:// 나 wss:// 로 입력되어도 로컬 HTTP REST API로 자동 전환하여 접속 안정성 극대화
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
