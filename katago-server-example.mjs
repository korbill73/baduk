/**
 * [KataGo HTTP & WebSocket Bridge Server]
 * 이 스크립트는 웹 바둑 앱(http://localhost:63333 또는 ws://localhost:63333)과 로컬 PC의 KataGo 엔진을 중계하는 Node.js 서버입니다.
 * 
 * [실행 방법 - 단 1줄!]
 * 터미널에 명령어 입력: node katago-server-example.mjs
 */

import http from 'http';
import { spawn } from 'child_process';

const PORT = 63333;

// 모의 프로 9단 추천 착수 생성 함수 (KataGo 연동 전 테스트용)
function getMockKataGoResponse(payload) {
  return {
    id: payload?.id || `mock-${Date.now()}`,
    turnNumber: (payload?.moves?.length || 0) + 1,
    moveInfos: [
      {
        move: 'D4', // GTP 좌표 예시 (화점에 화려하게 착수)
        visits: 500,
        winrate: 0.854,
        scoreLead: 12.5,
        order: 0
      },
      {
        move: 'Q16',
        visits: 350,
        winrate: 0.849,
        scoreLead: 11.8,
        order: 1
      },
      {
        move: 'R4',
        visits: 150,
        winrate: 0.841,
        scoreLead: 10.9,
        order: 2
      }
    ]
  };
}

// 1. HTTP REST API 서버 생성 (기본 내장 모듈 사용, 별도 npm 패키지 불필요)
const server = http.createServer((req, res) => {
  // CORS 허용 (브라우저에서 직접 접속할 수 있도록 설정)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log(`📥 [HTTP AI 요청] 대국 수읽기 요청 수신 (ID: ${payload.id}, 수순 길이: ${payload.moves?.length || 0}수)`);
        
        const responseData = getMockKataGoResponse(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
        console.log(`📤 [HTTP 응답 전송] 추천 착수 D4 (승률 기대치: 85.4%) 전송 완료!`);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('KataGo Bridge Server is Running on port 63333');
  }
});

// 2. ws 패키지가 설치되어 있다면 WebSocket 중계도 동시 가동
try {
  const { WebSocketServer } = await import('ws');
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    console.log(`✅ [WebSocket 연결 성공] 웹 바둑 클라이언트가 접속하였습니다.`);
    ws.on('message', (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        console.log(`📥 [WebSocket AI 요청] 수신 (ID: ${payload.id})`);
        ws.send(JSON.stringify(getMockKataGoResponse(payload)));
        console.log(`📤 [WebSocket 응답 전송] 완료!`);
      } catch (e) {
        console.error(e);
      }
    });
  });
  console.log(`🌐 [WebSocket 지원] ws://localhost:${PORT} 프로토콜이 함께 활성화되었습니다.`);
} catch {
  console.log(`💡 [안내] ws 패키지 미설치 시 HTTP REST(http://localhost:${PORT})로 완벽 동작합니다.`);
}

server.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 [KataGo HTTP/WebSocket 중계 서버] 정상 가동 중!`);
  console.log(`📡 서버 연결 주소 1: http://localhost:${PORT}`);
  console.log(`📡 서버 연결 주소 2: ws://localhost:${PORT}`);
  console.log(`💡 웹 앱 상단의 [🤖 전문 바둑 AI 연동] 모달에서 테스트 버튼을 눌러보세요!`);
  console.log(`========================================================`);
});
