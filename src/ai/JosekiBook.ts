import type { Point, BoardSize, StoneColor } from '../types/go';

interface OpeningMove {
  point: Point;
  weight: number;
  comment: string;
}

export class JosekiBook {
  static getOpeningMove(size: BoardSize, grid: StoneColor[][], turn: StoneColor): { point: Point; comment: string } | null {
    let totalStones = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] !== null) totalStones++;
      }
    }

    // Use opening book in the first 36 moves on 19x19 (16 on 13x13, 8 on 9x9)
    if (totalStones > (size === 19 ? 36 : size === 13 ? 16 : 8)) {
      return null;
    }

    const candidates: OpeningMove[] = [];
    const enemyColor: StoneColor = turn === 'black' ? 'white' : 'black';

    if (size === 19) {
      // 1. Four Corners (Star points & Komoku)
      const corners = [
        { x: 3, y: 3, name: '좌상귀 화점' },
        { x: 15, y: 3, name: '우상귀 화점' },
        { x: 3, y: 15, name: '좌하귀 화점' },
        { x: 15, y: 15, name: '우하귀 화점' },
        { x: 2, y: 3, name: '좌상귀 소목' },
        { x: 16, y: 3, name: '우상귀 소목' },
        { x: 3, y: 16, name: '좌하귀 소목' },
        { x: 15, y: 16, name: '우하귀 소목' }
      ];

      for (const c of corners) {
        if (grid[c.y][c.x] === null) {
          let isAreaEmpty = true;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = c.x + dx;
              const ny = c.y + dy;
              if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] !== null) {
                isAreaEmpty = false;
                break;
              }
            }
            if (!isAreaEmpty) break;
          }

          if (isAreaEmpty) {
            candidates.push({
              point: { x: c.x, y: c.y },
              weight: c.name.includes('화점') ? 16 : 14,
              comment: `포석 대세점: ${c.name} 점령으로 귀의 균형을 잡습니다.`
            });
          }
        }
      }

      // 2. Corner enclosures (귀굳힘) and approach moves (걸침) & 3-3 invasion
      const starPatterns = [
        // Approach to (3,3) star point
        { star: { x: 3, y: 3 }, move: { x: 5, y: 2 }, isApproach: true, comment: '좌상귀 날일자 걸침: 상대 세력을 분산시키고 귀 실리를 제한합니다.' },
        { star: { x: 3, y: 3 }, move: { x: 2, y: 5 }, isApproach: true, comment: '좌상귀 날일자 걸침: 좌변으로 확장하며 상대 귀를 압박합니다.' },
        { star: { x: 15, y: 3 }, move: { x: 13, y: 2 }, isApproach: true, comment: '우상귀 날일자 걸침: 상변 확장을 도모하며 상대 귀를 견제합니다.' },
        { star: { x: 15, y: 3 }, move: { x: 16, y: 5 }, isApproach: true, comment: '우상귀 날일자 걸침: 우변 주도권을 잡기 위한 현대 바둑 정석입니다.' },
        { star: { x: 3, y: 15 }, move: { x: 5, y: 16 }, isApproach: true, comment: '좌하귀 날일자 걸침: 하변 실리와 중앙 세력의 균형점입니다.' },
        { star: { x: 15, y: 15 }, move: { x: 13, y: 16 }, isApproach: true, comment: '우하귀 날일자 걸침: 우하귀 상대 세력 견제 및 실리 확보 정석.' },
        // Corner enclosure when we own the star point
        { star: { x: 3, y: 3 }, move: { x: 5, y: 2 }, isEnclosure: true, comment: '좌상귀 날일자 굳힘: 귀의 실리를 완벽하게 확정 짓는 튼튼한 한수.' },
        { star: { x: 15, y: 3 }, move: { x: 16, y: 5 }, isEnclosure: true, comment: '우상귀 날일자 굳힘: 귀 실리를 지키며 우변으로 세력을 뻗습니다.' },
        { star: { x: 3, y: 15 }, move: { x: 5, y: 16 }, isEnclosure: true, comment: '좌하귀 날일자 굳힘: 귀 실리를 수호하는 교과서적 포석.' },
        { star: { x: 15, y: 15 }, move: { x: 13, y: 16 }, isEnclosure: true, comment: '우하귀 날일자 굳힘: 상대 침입을 방비하며 실리를 굳힙니다.' },
        // 3-3 invasions under star points
        { star: { x: 3, y: 3 }, move: { x: 2, y: 2 }, isInvasion: true, comment: '삼삼(3,3) 침입: 실리를 파괴하며 귀의 주인을 바꾸는 AI 최애 정석.' },
        { star: { x: 15, y: 3 }, move: { x: 16, y: 2 }, isInvasion: true, comment: '삼삼(3,3) 침입: 우상귀 실리를 도려내는 현대 AI 정석.' },
        { star: { x: 3, y: 15 }, move: { x: 2, y: 16 }, isInvasion: true, comment: '삼삼(3,3) 침입: 좌하귀 실리 차지 및 알짜 타개 수법.' },
        { star: { x: 15, y: 15 }, move: { x: 16, y: 16 }, isInvasion: true, comment: '삼삼(3,3) 침입: 우하귀의 실리를 앗아오는 정석.' }
      ];

      for (const sp of starPatterns) {
        if (grid[sp.move.y][sp.move.x] === null) {
          const starStone = grid[sp.star.y][sp.star.x];
          if (sp.isApproach && starStone === enemyColor) {
            candidates.push({ point: sp.move, weight: 12, comment: sp.comment });
          } else if (sp.isEnclosure && starStone === turn) {
            candidates.push({ point: sp.move, weight: 13, comment: sp.comment });
          } else if (sp.isInvasion && starStone === enemyColor && totalStones >= 8) {
            candidates.push({ point: sp.move, weight: 11, comment: sp.comment });
          }
        }
      }

      // 3. Side Extensions (벌림: 상변 K4, 우변 Q10, 하변 K16, 좌변 D10)
      const sideExtensions = [
        { x: 9, y: 3, name: '상변 큰곳 벌림 (D4-Q4 사이)' },
        { x: 15, y: 9, name: '우변 큰곳 벌림 (Q4-Q16 사이)' },
        { x: 9, y: 15, name: '하변 큰곳 벌림 (D16-Q16 사이)' },
        { x: 3, y: 9, name: '좌변 큰곳 벌림 (D4-D16 사이)' }
      ];

      for (const se of sideExtensions) {
        if (grid[se.y][se.x] === null && totalStones >= 10) {
          // Verify no stones directly nearby
          let clean = true;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (grid[se.y + dy]?.[se.x + dx] !== null && grid[se.y + dy]?.[se.x + dx] !== undefined) {
                clean = false;
              }
            }
          }
          if (clean) {
            candidates.push({
              point: { x: se.x, y: se.y },
              weight: 10,
              comment: `포석 큰곳 벌림: ${se.name}에 전개하여 대모양의 기초를 다집니다.`
            });
          }
        }
      }

    } else if (size === 13) {
      const corners = [
        { x: 3, y: 3, name: '좌상귀 화점' },
        { x: 9, y: 3, name: '우상귀 화점' },
        { x: 3, y: 9, name: '좌하귀 화점' },
        { x: 9, y: 9, name: '우하귀 화점' },
        { x: 6, y: 6, name: '천원(중앙 대세점)' }
      ];
      for (const c of corners) {
        if (grid[c.y][c.x] === null) {
          candidates.push({
            point: { x: c.x, y: c.y },
            weight: c.name.includes('천원') ? 8 : 12,
            comment: `13줄 바둑 핵심 포석: ${c.name} 점거.`
          });
        }
      }
    } else if (size === 9) {
      const points = [
        { x: 4, y: 4, name: '천원(중앙 핵심)', weight: 14 },
        { x: 2, y: 2, name: '좌상귀 삼삼', weight: 11 },
        { x: 6, y: 2, name: '우상귀 삼삼', weight: 11 },
        { x: 2, y: 6, name: '좌하귀 삼삼', weight: 11 },
        { x: 6, y: 6, name: '우하귀 삼삼', weight: 11 },
        { x: 4, y: 2, name: '상변 날일자', weight: 9 },
        { x: 2, y: 4, name: '좌변 날일자', weight: 9 },
        { x: 6, y: 4, name: '우변 날일자', weight: 9 },
        { x: 4, y: 6, name: '하변 날일자', weight: 9 }
      ];
      for (const p of points) {
        if (grid[p.y][p.x] === null) {
          candidates.push({
            point: { x: p.x, y: p.y },
            weight: p.weight,
            comment: `9줄 바둑 급소: ${p.name} 차지.`
          });
        }
      }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.weight - a.weight);
    const topCandidates = candidates.filter(c => c.weight >= candidates[0].weight - 2);
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    return { point: chosen.point, comment: chosen.comment };
  }
}
