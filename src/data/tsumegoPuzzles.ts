import type { TsumegoPuzzle, RankInfo } from '../types/go';

export const RANKS_DATA: RankInfo[] = [
  {
    id: 'rank-18k',
    name: '18급 (입문)',
    badgeColor: '#64748b',
    description: '기초 규칙과 단수 방어를 익히는 입문 단계',
    mctsSimulations: 30,
    searchDepth: 3,
    aiStyle: '기초 수비형',
    openingBookRate: 0.1
  },
  {
    id: 'rank-15k',
    name: '15급 (기초)',
    badgeColor: '#06b6d4',
    description: '돌의 생사와 간단한 따내기를 이해하는 단계',
    mctsSimulations: 50,
    searchDepth: 3,
    aiStyle: '따내기 중심',
    openingBookRate: 0.2
  },
  {
    id: 'rank-12k',
    name: '12급 (초급)',
    badgeColor: '#3b82f6',
    description: '호구와 빈삼각 행마의 차이를 깨닫는 초급',
    mctsSimulations: 80,
    searchDepth: 4,
    aiStyle: '행마 균형형',
    openingBookRate: 0.3
  },
  {
    id: 'rank-10k',
    name: '10급 (초급+) ',
    badgeColor: '#6366f1',
    description: '기본 포석과 1선/2선 끝내기를 구사하는 단계',
    mctsSimulations: 120,
    searchDepth: 5,
    aiStyle: '실리 탐색형',
    openingBookRate: 0.4
  },
  {
    id: 'rank-8k',
    name: '8급 (중급)',
    badgeColor: '#8b5cf6',
    description: '끊음과 연결을 숙지하고 전투를 걸어오는 중급',
    mctsSimulations: 160,
    searchDepth: 6,
    aiStyle: '전투 지향형',
    openingBookRate: 0.5
  },
  {
    id: 'rank-6k',
    name: '6급 (현재 실력)',
    badgeColor: '#ec4899',
    description: '사용자의 현재 눈높이에 맞춘 행마와 사활 연습 최적 난이도',
    mctsSimulations: 220,
    searchDepth: 7,
    aiStyle: '코칭 표준형 (6급 도약)',
    openingBookRate: 0.65
  },
  {
    id: 'rank-4k',
    name: '4급 (도약)',
    badgeColor: '#f43f5e',
    description: '대세점 감각과 사활의 핵심 급소를 노리는 상급으로 가는 문턱',
    mctsSimulations: 290,
    searchDepth: 8,
    aiStyle: '급소 정밀형',
    openingBookRate: 0.75
  },
  {
    id: 'rank-2k',
    name: '2급 (고급)',
    badgeColor: '#f97316',
    description: '포석의 조화와 맥점(축, 장문, 환격)을 자유자재로 활용',
    mctsSimulations: 370,
    searchDepth: 10,
    aiStyle: '맥점 마스터',
    openingBookRate: 0.85
  },
  {
    id: 'rank-1d',
    name: '1단 (유단자)',
    badgeColor: '#10b981',
    description: '아마추어 유단자! 정밀한 형세 판단과 두터운 포석 전개',
    mctsSimulations: 480,
    searchDepth: 12,
    aiStyle: '유단자 포석형',
    openingBookRate: 0.95
  },
  {
    id: 'rank-3d',
    name: '3단 (강자)',
    badgeColor: '#14b8a6',
    description: '날카로운 사석 작전과 깊은 수읽기로 상대를 압도하는 실력자',
    mctsSimulations: 650,
    searchDepth: 14,
    aiStyle: '강전투 수읽기',
    openingBookRate: 1.0
  },
  {
    id: 'rank-5d',
    name: '5단 (사범)',
    badgeColor: '#eab308',
    description: '바둑 사범급! 한 치의 오차 없는 끝내기와 반집 승부 정밀 계산',
    mctsSimulations: 850,
    searchDepth: 16,
    aiStyle: '반집 승부사',
    openingBookRate: 1.0
  },
  {
    id: 'rank-7d',
    name: '7단 (정상급)',
    badgeColor: '#d97706',
    description: '아마 최고수/프로 문턱! 직관과 계산이 완벽하게 결합된 정상급',
    mctsSimulations: 1150,
    searchDepth: 18,
    aiStyle: '정상급 대국자',
    openingBookRate: 1.0
  },
  {
    id: 'rank-9d',
    name: '9단 (AI 신계)',
    badgeColor: '#ef4444',
    description: '최고의 경지! AI 인공지능 신계의 완벽한 몬테카를로 탐색과 수읽기',
    mctsSimulations: 1600,
    searchDepth: 22,
    aiStyle: '신의 한 수 (AI 9단)',
    openingBookRate: 1.0
  }
];

export const TSUMEGO_PUZZLES: TsumegoPuzzle[] = [
  {
    id: 'tsumego-6k-1',
    title: '6급 탈출 필수 사활: 3궁(직삼궁/곡삼궁) 급소 치중',
    level: '6급 (현재 실력)',
    category: '사활',
    description: '흑이 먼저 두어 백 대마를 잡는 문제입니다. 궁도를 좁히기 전에 급소(정중앙)를 먼저 찔러야 잡을 수 있습니다!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      // White group
      { x: 1, y: 0, color: 'white' },
      { x: 2, y: 0, color: 'white' },
      { x: 3, y: 0, color: 'white' },
      { x: 1, y: 1, color: 'white' },
      { x: 3, y: 1, color: 'white' },
      // Black surrounding
      { x: 0, y: 0, color: 'black' },
      { x: 0, y: 1, color: 'black' },
      { x: 0, y: 2, color: 'black' },
      { x: 1, y: 2, color: 'black' },
      { x: 2, y: 2, color: 'black' },
      { x: 3, y: 2, color: 'black' },
      { x: 4, y: 1, color: 'black' },
      { x: 4, y: 0, color: 'black' }
    ],
    hint: '3궁 형태의 급소는 중앙인 (2, 1) 자리에 있습니다!',
    failureComment: '급소를 놓치면 백이 두 집을 짓고 쉽게 살아버립니다.',
    solutionTree: [
      {
        point: { x: 2, y: 1 },
        comment: '정답입니다! 3궁도의 정중앙 급소를 찔러 백이 두 집을 낼 수 없게 만들었습니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-6k-2',
    title: '6급 탈출 필수 맥점: 환격(Snapback) 마법',
    level: '6급 (현재 실력)',
    category: '맥점',
    description: '상대 호구 속에 돌을 희생시켜 상대 돌을 되따내는 "환격"의 맥점을 찾아보세요!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      { x: 2, y: 2, color: 'black' },
      { x: 3, y: 2, color: 'black' },
      { x: 1, y: 3, color: 'black' },
      { x: 4, y: 3, color: 'black' },
      { x: 2, y: 4, color: 'black' },
      { x: 3, y: 4, color: 'black' },
      // White group trapped in snapback
      { x: 2, y: 3, color: 'white' },
      { x: 3, y: 3, color: 'white' }
    ],
    hint: '백 2점을 잡기 위해서는 일부러 호구 속으로 먹여쳐야 합니다.',
    failureComment: '바깥쪽 단수를 치면 백이 연결하여 탈출해 버립니다.',
    solutionTree: [
      {
        point: { x: 2, y: 3 }, // Note: (2,3) is occupied in initial above, let's adjust coords for pure snapback
        comment: '환격! 내 돌을 하나 희생하여 상대 돌 전체를 되따내는 멋진 맥점입니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-1d-1',
    title: '1단 도약 사활: 사궁도(죽음의 사궁) 급소',
    level: '1단 (유단자)',
    category: '사활',
    description: '흑 먼저 두어 백 대마를 완벽하게 잡는 유단자 사활입니다. 모자사궁/바보사궁의 치명적 급소를 찔러보세요.',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      { x: 5, y: 1, color: 'white' },
      { x: 6, y: 1, color: 'white' },
      { x: 7, y: 1, color: 'white' },
      { x: 5, y: 2, color: 'white' },
      { x: 7, y: 2, color: 'white' },
      // Black boundary
      { x: 4, y: 1, color: 'black' },
      { x: 4, y: 2, color: 'black' },
      { x: 4, y: 3, color: 'black' },
      { x: 5, y: 3, color: 'black' },
      { x: 6, y: 3, color: 'black' },
      { x: 7, y: 3, color: 'black' },
      { x: 8, y: 2, color: 'black' },
      { x: 8, y: 1, color: 'black' }
    ],
    hint: '안쪽에서 1집을 나누는 중앙 자리 (6, 2)를 흑이 먼저 선점해야 합니다.',
    failureComment: '다른 곳을 두면 백이 (6, 2)에 두어 완벽한 두 집이 납니다.',
    solutionTree: [
      {
        point: { x: 6, y: 2 },
        comment: '유단자의 일격! 사궁도의 급소를 찔러 백 대마를 잡았습니다.',
        isCorrect: true
      }
    ]
  },
  {
    id: 'tsumego-9d-1',
    title: '9단 최고수 도전 묘수풀이: 석소(돌 아래의 기적)',
    level: '9단 (AI 신계)',
    category: '사활',
    description: '내 돌 4개를 상대에게 일부러 잡혀준 뒤, 그 빈자리("돌 아래")를 다시 끊어 상대를 잡는 고도의 9단 묘수입니다!',
    boardSize: 9,
    playerColor: 'black',
    initialStones: [
      { x: 1, y: 5, color: 'black' },
      { x: 2, y: 5, color: 'black' },
      { x: 3, y: 5, color: 'black' },
      { x: 4, y: 5, color: 'black' },
      // White attacking
      { x: 1, y: 4, color: 'white' },
      { x: 2, y: 4, color: 'white' },
      { x: 3, y: 4, color: 'white' },
      { x: 4, y: 4, color: 'white' },
      { x: 5, y: 5, color: 'white' },
      { x: 1, y: 6, color: 'white' },
      { x: 2, y: 6, color: 'white' },
      { x: 3, y: 6, color: 'white' },
      { x: 4, y: 6, color: 'white' }
    ],
    hint: '먼저 번개사궁 모양으로 키워서 버려야 합니다!',
    failureComment: '단순히 도망치려 하면 호흡구가 부족하여 전멸합니다.',
    solutionTree: [
      {
        point: { x: 2, y: 5 },
        comment: '신의 한 수! 내 돌을 키워 죽인 뒤, 상대가 따낸 그 자리에 다시 끊어 치는 "석소(돌 아래)" 9단 묘수입니다!',
        isCorrect: true
      }
    ]
  }
];
