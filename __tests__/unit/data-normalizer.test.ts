/**
 * DataNormalizer 단위 테스트
 *
 * 데이터 정규화 로직 케이스 테스트
 */

import { normalizeData } from '../../src/utils/data-normalizer';
import { ScrapedDelayInfo, FormattedDelayData } from '../../src/types';

describe('DataNormalizer', () => {
  describe('normalizeData - 정상 케이스', () => {
    it('서울교통공사 데이터 정규화: 단일 항목', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('1호선');
      expect(result[0].direction).toBe('상행선');
      expect(result[0].timeRange).toBe('첫차~09시');
      expect(result[0].delayDate).toBe('251206');
      expect(result[0].delayTime).toBe('5');
      // normalizeData는 pdfBase64 필드를 설정하지 않음 (pdfDataYn에 따라 나중에 설정됨)
      expect(result[0].pdfBase64).toBeUndefined();
      expect(result[0].delayStart).toMatch(/^\d{12}$/);
      expect(result[0].delayEnd).toMatch(/^\d{12}$/);
    });

    it('코레일 데이터 정규화: 단일 항목', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'korail',
          line: '경의선',
          direction: '상행선',
          timeRange: '첫차~08시',
          delayMinutes: '10'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('경의선');
      expect(result[0].direction).toBe('상행선');
      expect(result[0].timeRange).toBe('첫차~08시');
      expect(result[0].delayDate).toBe('251206');
      expect(result[0].delayTime).toBe('10');
      // normalizeData는 pdfBase64 필드를 설정하지 않음 (pdfDataYn에 따라 나중에 설정됨)
      expect(result[0].pdfBase64).toBeUndefined();
    });

    it('여러 항목 정규화: 서울교통공사 + 코레일', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        },
        {
          site: 'korail',
          line: '경의선',
          direction: '하행선',
          timeRange: '10시~18시',
          delayMinutes: '15'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(2);
      // FormattedDelayData에는 site 속성이 없음 (정규화 과정에서 제거됨)
      expect(result[0].line).toBe('1호선');
      expect(result[1].line).toBe('경의선');
    });

    it('막차 시간대 정규화: 다음날 처리', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '18시~막차',
          delayMinutes: '20'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(1);
      // delayEnd는 다음날 02:00이어야 함
      expect(result[0].delayEnd).toContain('20251207');
      expect(result[0].delayEnd).toContain('0200');
    });

    it('delayDate 형식 검증: YYMMDD', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayDate).toBe('251206');
      expect(result[0].delayDate.length).toBe(6);
    });

    it('delayStart/delayEnd 형식 검증: YYYYMMDDHHmm', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart.length).toBe(12);
      expect(result[0].delayEnd.length).toBe(12);
      expect(result[0].delayStart).toMatch(/^\d{12}$/);
      expect(result[0].delayEnd).toMatch(/^\d{12}$/);
    });
  });

  describe('normalizeData - 시간대별 검증', () => {
    it('서울교통공사 시간대: 첫차~09시', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart).toContain('202512060400');
      expect(result[0].delayEnd).toContain('202512060900');
    });

    it('서울교통공사 시간대: 09시~18시', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '09시~18시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart).toContain('202512060900');
      expect(result[0].delayEnd).toContain('202512061800');
    });

    it('서울교통공사 시간대: 18시~막차 (다음날)', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '18시~막차',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart).toContain('202512061800');
      expect(result[0].delayEnd).toContain('202512070200');
    });

    it('코레일 시간대: 첫차~08시', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'korail',
          line: '경의선',
          direction: '상행선',
          timeRange: '첫차~08시',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart).toContain('202512060400');
      expect(result[0].delayEnd).toContain('202512060800');
    });

    it('코레일 시간대: 22시~막차 (다음날)', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'korail',
          line: '경의선',
          direction: '상행선',
          timeRange: '22시~막차',
          delayMinutes: '5'
        }
      ];

      const result = normalizeData(data, '20251206');

      expect(result[0].delayStart).toContain('202512062200');
      expect(result[0].delayEnd).toContain('202512070200');
    });
  });

  describe('normalizeData - 에러 처리', () => {
    it('알 수 없는 시간대: 스킵 처리', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '알 수 없는 시간대',
          delayMinutes: '5'
        }
      ];

      // 에러가 발생하지만 스킵되어 빈 배열 반환
      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(0);
    });

    it('일부 항목 실패: 성공한 항목만 반환', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '5'
        },
        {
          site: 'seoulmetro',
          line: '2호선',
          direction: '상행선',
          timeRange: '알 수 없는 시간대',
          delayMinutes: '10'
        }
      ];

      const result = normalizeData(data, '20251206');

      // 첫 번째 항목만 성공
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('1호선');
    });
  });

  describe('normalizeData - 빈 입력', () => {
    it('빈 배열: 빈 배열 반환', () => {
      const data: ScrapedDelayInfo[] = [];

      const result = normalizeData(data, '20251206');

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
