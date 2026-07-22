import type { TsumegoPuzzle, RankInfo } from '../types/go';

export const RANKS_DATA: RankInfo[] = [
  {
    id: 'rank-18k',
    name: '3수 읽기 (입문)',
    badgeColor: '#64748b',
    description: '기초 규칙과 단수 방어를 위해 3수 앞을 내다보는 입문 AI',
    mctsSimulations: 30,
    searchDepth: 3,
    aiStyle: '기초 수비형',
    openingBookRate: 0.1
  },
  {
    id: 'rank-15k',
    name: '5수 읽기 (기초)',
    badgeColor: '#06b6d4',
    description: '돌의 생사와 간단한 따내기를 위해 5수 앞을 계산하는 기초 AI',
    mctsSimulations: 50,
    searchDepth: 5,
    aiStyle: '따내기 중심',
    openingBookRate: 0.2
  },
  {
    id: 'rank-12k',
    name: '8수 읽기 (초급)',
    badgeColor: '#3b82f6',
    description: '호구와 빈삼각 행마의 차이를 8수 수읽기로 파악하는 초급 AI',
    mctsSimulations: 80,
    searchDepth: 8,
    aiStyle: '행마 균형형',
    openingBookRate: 0.3
  },
  {
    id: 'rank-10k',
    name: '10수 읽기 (초급+)',
    badgeColor: '#6366f1',
    description: '기본 포석과 끝내기를 위해 10수 앞을 수읽기하는 AI',
    mctsSimulations: 120,
    searchDepth: 10,
    aiStyle: '실리 탐색형',
    openingBookRate: 0.4
  },
  {
    id: 'rank-8k',
    name: '15수 읽기 (중급)',
    badgeColor: '#8b5cf6',
    description: '끊음과 연결, 전투를 위해 15수 깊이로 정밀 계산하는 AI',
    mctsSimulations: 160,
    searchDepth: 15,
    aiStyle: '전투 지향형',
    openingBookRate: 0.5
  },
  {
    id: 'rank-6k',
    name: '20수 읽기 (중급+)',
    badgeColor: '#ec4899',
    description: '사용자의 수읽기 훈련을 위해 20수 앞을 차분히 내다보는 AI',
    mctsSimulations: 220,
    searchDepth: 20,
    aiStyle: '코칭 표준형',
    openingBookRate: 0.65
  },
  {
    id: 'rank-4k',
    name: '30수 읽기 (상급)',
    badgeColor: '#f43f5e',
    description: '사활의 핵심 급소와 변화수를 30수 깊이로 예측하는 상급 AI',
    mctsSimulations: 290,
    searchDepth: 30,
    aiStyle: '급소 정밀형',
    openingBookRate: 0.75
  },
  {
    id: 'rank-2k',
    name: '40수 읽기 (고급)',
    badgeColor: '#f97316',
    description: '축, 장문, 환격 등 맥점 수읽기를 40수까지 자유자재로 연산',
    mctsSimulations: 370,
    searchDepth: 40,
    aiStyle: '맥점 마스터',
    openingBookRate: 0.85
  },
  {
    id: 'rank-1d',
    name: '50수 읽기 (유단자)',
    badgeColor: '#10b981',
    description: '유단자 실력! 50수 정밀 수읽기와 두터운 포석 전개',
    mctsSimulations: 480,
    searchDepth: 50,
    aiStyle: '유단자 포석형',
    openingBookRate: 0.95
  },
  {
    id: 'rank-3d',
    name: '80수 읽기 (강자)',
    badgeColor: '#14b8a6',
    description: '80수 깊은 수읽기와 사석 작전으로 상대를 압도하는 고성능 AI',
    mctsSimulations: 650,
    searchDepth: 80,
    aiStyle: '강전투 수읽기',
    openingBookRate: 1.0
  },
  {
    id: 'rank-5d',
    name: '120수 읽기 (사범급)',
    badgeColor: '#eab308',
    description: '120수 오차 없는 끝내기와 반집 승부 수읽기 계산',
    mctsSimulations: 850,
    searchDepth: 120,
    aiStyle: '반집 승부사',
    openingBookRate: 1.0
  },
  {
    id: 'rank-7d',
    name: '200수 읽기 (정상급)',
    badgeColor: '#d97706',
    description: '200수 초장기 수읽기와 직관 연산이 결합된 최고 수준 AI',
    mctsSimulations: 200,
    searchDepth: 200,
    aiStyle: '정상급 대국자',
    openingBookRate: 1.0
  },
  {
    id: 'rank-9d',
    name: '300수 읽기 (AI 신계)',
    badgeColor: '#ef4444',
    description: '최고의 경지! 300수 완전 탐색과 KataGo 신계 수준의 초정밀 수읽기',
    mctsSimulations: 300,
    searchDepth: 300,
    aiStyle: 'KataGo AI 신계',
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
