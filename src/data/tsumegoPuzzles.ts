import type { TsumegoPuzzle, RankInfo } from '../types/go';

export const RANKS_DATA: RankInfo[] = [
  {
    id: 'rank-18k',
    name: 'STAGE 1 (입문 왕초보)',
    badgeColor: '#10b981',
    description: '극초보 맞춤! 1수 연산으로 부담없이 첫 걸음을 떼는 입문 AI',
    mctsSimulations: 1,
    searchDepth: 1,
    aiStyle: '입문 왕초보',
    openingBookRate: 0.01
  },
  {
    id: 'rank-17k',
    name: 'STAGE 2 (초보 탐색기)',
    badgeColor: '#14b8a6',
    description: '초보 연습용! 바둑의 기본 연결과 집짓기 감각을 넓히는 AI',
    mctsSimulations: 2,
    searchDepth: 1,
    aiStyle: '초보 탐색기',
    openingBookRate: 0.02
  },
  {
    id: 'rank-16k',
    name: 'STAGE 3 (★ 초급 표준)',
    badgeColor: '#06b6d4',
    description: '★ 초급 대표 표준! 바둑의 집짓기와 응수 재미를 가장 완성도 높게 즐기는 추천 AI',
    mctsSimulations: 3,
    searchDepth: 2,
    aiStyle: '★ 초급 표준',
    openingBookRate: 0.03
  },
  {
    id: 'rank-15k',
    name: 'STAGE 4 (단수 감각기)',
    badgeColor: '#38bdf8',
    description: '기초 입문용! 단수 살리기와 따내기 감각을 기르는 AI',
    mctsSimulations: 4,
    searchDepth: 2,
    aiStyle: '단수 감각기',
    openingBookRate: 0.04
  },
  {
    id: 'rank-14k',
    name: 'STAGE 5 (행마 훈련기)',
    badgeColor: '#3b82f6',
    description: '기초+ 단계! 돌의 연결과 실전 행마를 겨루는 AI',
    mctsSimulations: 5,
    searchDepth: 3,
    aiStyle: '행마 훈련기',
    openingBookRate: 0.05
  },
  {
    id: 'rank-12k',
    name: 'STAGE 6 (실전 초급자)',
    badgeColor: '#6366f1',
    description: '초급 단계! 8회 정밀 탐색으로 실전 수읽기 훈련을 돕는 AI',
    mctsSimulations: 8,
    searchDepth: 3,
    aiStyle: '실전 초급자',
    openingBookRate: 0.08
  },
  {
    id: 'rank-10k',
    name: 'STAGE 7 (포석 세력가)',
    badgeColor: '#8b5cf6',
    description: '초급+ 단계! 귀와 변의 넓은 포석과 세력 균형을 파악하는 AI',
    mctsSimulations: 12,
    searchDepth: 5,
    aiStyle: '포석 세력가',
    openingBookRate: 0.12
  },
  {
    id: 'rank-8k',
    name: 'STAGE 8 (중급 승부사)',
    badgeColor: '#a855f7',
    description: '중급 입문! 전투와 끊음 급소를 수읽기하는 AI',
    mctsSimulations: 20,
    searchDepth: 8,
    aiStyle: '중급 승부사',
    openingBookRate: 0.20
  },
  {
    id: 'rank-6k',
    name: 'STAGE 9 (사활 연산가)',
    badgeColor: '#d946ef',
    description: '중급+ 단계! 사활 및 끝내기 계산을 시도하는 AI',
    mctsSimulations: 35,
    searchDepth: 10,
    aiStyle: '사활 연산가',
    openingBookRate: 0.30
  },
  {
    id: 'rank-4k',
    name: 'STAGE 10 (상급 형세가)',
    badgeColor: '#ec4899',
    description: '상급 입문! 60회 깊이로 집 계산과 형세를 추산하는 AI',
    mctsSimulations: 60,
    searchDepth: 15,
    aiStyle: '상급 형세가',
    openingBookRate: 0.45
  },
  {
    id: 'rank-2k',
    name: 'STAGE 11 (정밀 사활가)',
    badgeColor: '#f43f5e',
    description: '상급+ 단계! 100회 정밀 연산으로 강력한 사활 공격을 펼치는 AI',
    mctsSimulations: 100,
    searchDepth: 20,
    aiStyle: '정밀 사활가',
    openingBookRate: 0.60
  },
  {
    id: 'rank-1d',
    name: 'STAGE 12 (아마 유단자)',
    badgeColor: '#fb923c',
    description: '유단자 실력! 200회 탐색과 두터운 포석 전개 고성능 AI',
    mctsSimulations: 200,
    searchDepth: 50,
    aiStyle: '아마 유단자',
    openingBookRate: 0.75
  },
  {
    id: 'rank-5d',
    name: 'STAGE 13 (사범급 고수)',
    badgeColor: '#eab308',
    description: '사범급 실력! 500회 수읽기와 오차 없는 반집 승부사 AI',
    mctsSimulations: 500,
    searchDepth: 100,
    aiStyle: '사범급 고수',
    openingBookRate: 0.90
  },
  {
    id: 'rank-9d',
    name: 'STAGE 14 (AI 신계 마스터)',
    badgeColor: '#fbbf24',
    description: '최고의 경지! 800회 완전 탐색과 KataGo 신계 수준 AI',
    mctsSimulations: 800,
    searchDepth: 300,
    aiStyle: 'AI 신계 마스터',
    openingBookRate: 1.0
  }
];

export const TSUMEGO_PUZZLES: TsumegoPuzzle[] = [
  {
    id: 'tsumego-6k-1',
    title: '6급 필수 사활: 3궁도(직삼궁) 급소 치중',
    level: '6급 (중급+)',
    category: '사활',
    description: '흑이 먼저 두어 백 대마를 잡는 문제입니다. 궁도를 좁히기 전에 3궁의 정중앙 급소를 찔러야 합니다!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      // White inside (3궁 형태: (1,1), (2,1), (3,1) 중 (2,1)이 급소)
      { x: 1, y: 1, color: 'white' },
      { x: 3, y: 1, color: 'white' },
      { x: 1, y: 0, color: 'white' },
      { x: 2, y: 0, color: 'white' },
      { x: 3, y: 0, color: 'white' },
      // Black surrounding
      { x: 0, y: 0, color: 'black' },
      { x: 0, y: 1, color: 'black' },
      { x: 0, y: 2, color: 'black' },
      { x: 1, y: 2, color: 'black' },
      { x: 2, y: 2, color: 'black' },
      { x: 3, y: 2, color: 'black' },
      { x: 4, y: 2, color: 'black' },
      { x: 4, y: 1, color: 'black' },
      { x: 4, y: 0, color: 'black' }
    ],
    hint: '3궁도의 중앙인 (2, 1) 빈자리를 흑이 먼저 치중해야 백이 두 집을 낼 수 없습니다!',
    failureComment: '다른 곳을 두면 백이 (2, 1)에 두어 완벽하게 살아버립니다.',
    solutionTree: [
      {
        point: { x: 2, y: 1 },
        comment: '정답입니다! 3궁도의 정중앙 급소를 찔러 백 대마를 잡았습니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-6k-2',
    title: '6급 필수 맥점: 환격(Snapback)의 묘수',
    level: '6급 (중급+)',
    category: '맥점',
    description: '상대 호구 속에 내 돌 1개를 일부러 먹여쳐 잡혀준 뒤, 백 2점을 되따내는 "환격"의 맥점을 찾아보세요!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      // Black surrounding
      { x: 2, y: 1, color: 'black' },
      { x: 3, y: 1, color: 'black' },
      { x: 1, y: 2, color: 'black' },
      { x: 4, y: 2, color: 'black' },
      { x: 1, y: 3, color: 'black' },
      { x: 4, y: 3, color: 'black' },
      { x: 2, y: 4, color: 'black' },
      { x: 3, y: 4, color: 'black' },
      // White group
      { x: 2, y: 2, color: 'white' },
      { x: 3, y: 2, color: 'white' }
      // Empty target snapback point is (2,3)
    ],
    hint: '백 호구 안쪽인 (2, 3) 빈자리에 돌을 먹여쳐야 되따낼 수 있습니다.',
    failureComment: '바깥쪽 단수를 치면 백이 연결하여 탈출합니다.',
    solutionTree: [
      {
        point: { x: 2, y: 3 },
        comment: '환격(Snapback) 정답! 내 돌 1개를 던져주고 상대 2점을 되따내는 통쾌한 맥점입니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-1d-1',
    title: '50수 읽기 사활: 사궁도(모자사궁) 치중',
    level: '50수 읽기 (유단자)',
    category: '사활',
    description: '흑이 먼저 두어 백 대마를 완벽하게 잡는 유단자 사활입니다. 모자사궁 형태의 치명적 급소를 찔러보세요.',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      // White inside (모자사궁: (5,1), (6,1), (7,1), (6,2) 중 (6,2)가 급소)
      { x: 5, y: 1, color: 'white' },
      { x: 6, y: 1, color: 'white' },
      { x: 7, y: 1, color: 'white' },
      { x: 5, y: 0, color: 'white' },
      { x: 6, y: 0, color: 'white' },
      { x: 7, y: 0, color: 'white' },
      // Black boundary
      { x: 4, y: 0, color: 'black' },
      { x: 4, y: 1, color: 'black' },
      { x: 4, y: 2, color: 'black' },
      { x: 5, y: 2, color: 'black' },
      { x: 7, y: 2, color: 'black' },
      { x: 8, y: 2, color: 'black' },
      { x: 8, y: 1, color: 'black' },
      { x: 8, y: 0, color: 'black' }
    ],
    hint: '안쪽 한 집을 나누는 핵심 급소 자리 (6, 1)을 선점하세요!',
    failureComment: '급소를 놓치면 백이 집을 만들고 살아버립니다.',
    solutionTree: [
      {
        point: { x: 6, y: 1 },
        comment: '사궁도 정답! 급소를 정확히 선점하여 백 대마를 잡았습니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-9d-1',
    title: '300수 읽기 묘수풀이: 촉촉수(연단수) 먹여치기',
    level: '300수 읽기 (AI 신계)',
    category: '묘수',
    description: '상대 자충을 유도하는 먹여치기 단수로 백 3점을 몰아 싹 따내는 고난도 묘수풀이입니다!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      // Black attacking
      { x: 1, y: 2, color: 'black' },
      { x: 2, y: 1, color: 'black' },
      { x: 4, y: 1, color: 'black' },
      { x: 5, y: 2, color: 'black' },
      { x: 3, y: 3, color: 'black' },
      // White target group
      { x: 2, y: 2, color: 'white' },
      { x: 3, y: 2, color: 'white' },
      { x: 4, y: 2, color: 'white' }
      // Empty sacrifice point is (3,1)
    ],
    hint: '백 호구 속의 빈자리 (3, 1)에 돌을 집어넣어 연단수(촉촉수)를 만들어야 합니다!',
    failureComment: '바깥 단수를 치면 백이 꽉 이어 탈출합니다.',
    solutionTree: [
      {
        point: { x: 3, y: 1 },
        comment: '촉촉수(연단수) 묘수 정답! 먹여치기로 상대 3점을 몰살시키는 환상적인 한 수입니다!',
        isCorrect: true
      }
    ]
  }
];
