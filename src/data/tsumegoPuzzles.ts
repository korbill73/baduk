import type { TsumegoPuzzle, RankInfo } from '../types/go';

export const RANKS_DATA: RankInfo[] = [
  {
    id: 'rank-18k',
    name: '1수 읽기 (입문 5회)',
    badgeColor: '#10b981',
    description: '기초 입문용! 5회 가벼운 연산으로 쉬운 수읽기를 제공하는 초보 AI',
    mctsSimulations: 5,
    searchDepth: 1,
    aiStyle: '초보 친화형',
    openingBookRate: 0.05
  },
  {
    id: 'rank-15k',
    name: '2수 읽기 (입문 10회)',
    badgeColor: '#14b8a6',
    description: '기초 연습용! 10회 탐색으로 한 걸음씩 바둑을 깨우치는 AI',
    mctsSimulations: 10,
    searchDepth: 2,
    aiStyle: '기초 수비형',
    openingBookRate: 0.1
  },
  {
    id: 'rank-12k',
    name: '3수 읽기 (기초 15회)',
    badgeColor: '#06b6d4',
    description: '단수 방어와 연결을 위해 15회 연산으로 수읽기하는 기초 AI',
    mctsSimulations: 15,
    searchDepth: 3,
    aiStyle: '단수 탐지형',
    openingBookRate: 0.15
  },
  {
    id: 'rank-10k',
    name: '4수 읽기 (기초 20회)',
    badgeColor: '#38bdf8',
    description: '돌의 생사와 따내기를 위해 20회 계산하는 기초+ AI',
    mctsSimulations: 20,
    searchDepth: 4,
    aiStyle: '따내기 반응형',
    openingBookRate: 0.2
  },
  {
    id: 'rank-8k',
    name: '5수 읽기 (초급 25회)',
    badgeColor: '#3b82f6',
    description: '행마 균형과 세력을 위해 25회 정밀 탐색하는 초급 AI',
    mctsSimulations: 25,
    searchDepth: 5,
    aiStyle: '행마 균형형',
    openingBookRate: 0.25
  },
  {
    id: 'rank-6k',
    name: '8수 읽기 (초급+ 40회)',
    badgeColor: '#6366f1',
    description: '기본 포석과 사활 감각을 위해 40회 탐색하는 초급+ AI',
    mctsSimulations: 40,
    searchDepth: 8,
    aiStyle: '포석 탐색형',
    openingBookRate: 0.3
  },
  {
    id: 'rank-4k',
    name: '10수 읽기 (중급 70회)',
    badgeColor: '#8b5cf6',
    description: '전투와 연결을 위해 70회 깊이로 수읽기하는 중급 AI',
    mctsSimulations: 70,
    searchDepth: 10,
    aiStyle: '전투 지향형',
    openingBookRate: 0.4
  },
  {
    id: 'rank-2k',
    name: '15수 읽기 (중급+ 110회)',
    badgeColor: '#a855f7',
    description: '끊음과 사활 변화수를 위해 110회 계산하는 중급+ AI',
    mctsSimulations: 110,
    searchDepth: 15,
    aiStyle: '사활 정밀형',
    openingBookRate: 0.5
  },
  {
    id: 'rank-1d',
    name: '20수 읽기 (상급 160회)',
    badgeColor: '#d946ef',
    description: '상급 수읽기 훈련을 위해 160회 차분히 내다보는 AI',
    mctsSimulations: 160,
    searchDepth: 20,
    aiStyle: '실리 수비형',
    openingBookRate: 0.6
  },
  {
    id: 'rank-3d',
    name: '30수 읽기 (고급 230회)',
    badgeColor: '#ec4899',
    description: '핵심 급소와 맥점을 230회 깊이로 수읽기하는 고급 AI',
    mctsSimulations: 230,
    searchDepth: 30,
    aiStyle: '맥점 공략형',
    openingBookRate: 0.7
  },
  {
    id: 'rank-5d',
    name: '50수 읽기 (유단자 350회)',
    badgeColor: '#f43f5e',
    description: '유단자 실력! 350회 정밀 수읽기와 두터운 포석 전개',
    mctsSimulations: 350,
    searchDepth: 50,
    aiStyle: '두터움 중시',
    openingBookRate: 0.8
  },
  {
    id: 'rank-7d',
    name: '100수 읽기 (사범급 500회)',
    badgeColor: '#fb923c',
    description: '500회 수읽기와 계가 계산이 연동된 사범급 AI',
    mctsSimulations: 500,
    searchDepth: 100,
    aiStyle: '사범급 정밀형',
    openingBookRate: 0.9
  },
  {
    id: 'rank-9d',
    name: '300수 읽기 (AI 신계 800회)',
    badgeColor: '#fbbf24',
    description: '최고의 경지! 800회 완전 탐색과 KataGo 신계 수준 AI',
    mctsSimulations: 800,
    searchDepth: 300,
    aiStyle: '신계 절대 수읽기',
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
