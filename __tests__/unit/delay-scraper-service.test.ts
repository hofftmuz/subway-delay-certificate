/**
 * DelayScraperService 단위 테스트
 *
 * 서비스 레이어의 모든 케이스 테스트 (Mock 기반)
 */

import { DelayScraperService } from '../../src/services/delay-scraper-service';
import { SeoulMetroScraper } from '../../src/scrapers/seoul-metro-scraper';
import { KorailScraper } from '../../src/scrapers/korail-scraper';
import { InputDTO, ScrapedDelayInfo, FormattedDelayData } from '../../src/types';
import { ERROR_CODES } from '../../src/config/error-codes';
import { ERROR_TYPES } from '../../src/config/error-types';

// 스크래퍼 모킹
jest.mock('../../src/scrapers/seoul-metro-scraper');
jest.mock('../../src/scrapers/korail-scraper');

/**
 * 테스트용 날짜 계산 헬퍼 함수
 *
 * @param daysAgo - 오늘로부터 며칠 전인지 (기본값: 3)
 * @returns YYYYMMDD 형식의 날짜 문자열
 */
function getDateString(daysAgo: number = 3): string {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - daysAgo);
  return targetDate.toISOString().slice(0, 10).replace(/-/g, '');
}

describe('DelayScraperService', () => {
  let service: DelayScraperService;
  let mockSeoulMetroScraper: jest.Mocked<SeoulMetroScraper>;
  let mockKorailScraper: jest.Mocked<KorailScraper>;

  beforeEach(() => {
    mockSeoulMetroScraper = {
      scrape: jest.fn()
    } as any;

    mockKorailScraper = {
      scrape: jest.fn()
    } as any;

    (SeoulMetroScraper as jest.Mock).mockImplementation(() => mockSeoulMetroScraper);
    (KorailScraper as jest.Mock).mockImplementation(() => mockKorailScraper);

    service = new DelayScraperService();
  });

  describe('processRequest - 정상 케이스', () => {
    it('전체 플로우: 두 사이트 모두 성공', async () => {
      // 7일 이내 날짜로 설정 (부분 실패 없음)
      const dateStr = getDateString(3);

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '5',
            pdfDataYn: '0'
          }
        }
      };

      const mockScrapedData: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '10'
        }
      ];

      mockSeoulMetroScraper.scrape.mockResolvedValue(mockScrapedData);
      mockKorailScraper.scrape.mockResolvedValue([]);

      const result = await service.processRequest(input);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS.code);
      expect(result.out.data.ch2.data.dataArray.length).toBeGreaterThan(0);
    });

    it('전체 플로우: 데이터 없음', async () => {
      // 7일 이내 날짜로 설정 (부분 실패 없음)
      const dateStr = getDateString(3);

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr
          }
        }
      };

      mockSeoulMetroScraper.scrape.mockResolvedValue([]);
      mockKorailScraper.scrape.mockResolvedValue([]);

      const result = await service.processRequest(input);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS_NO_DATA.code);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(0);
    });
  });

  describe('validate - 입력 검증', () => {
    it('기본값 적용: 빈 입력', () => {
      const input: InputDTO = { in: { ch2: {} } };
      const result = service.validate(input);

      expect(result.inqrDate).toMatch(/^\d{8}$/);
      expect(result.delayTime).toBe('30');
      expect(result.pdfDataYn).toBe('0');
    });

    it('정상 입력: 모든 필드 제공', () => {
      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: '20251206',
            delayTime: '5',
            pdfDataYn: '1'
          }
        }
      };
      const result = service.validate(input);

      expect(result.inqrDate).toBe('20251206');
      expect(result.delayTime).toBe('5');
      expect(result.pdfDataYn).toBe('1');
    });
  });

  describe('scrape - 날짜 범위 체크', () => {
    it('30일 초과: ValidationError 발생', async () => {
      const date = '20241101'; // 30일 이상 전

      await expect(service.scrape(date)).rejects.toThrow();
    });

    it('7일 초과: 코레일 생략 (부분 실패)', async () => {
      // 오늘로부터 10일 전 날짜 (7일 초과, 30일 이내)
      const date = getDateString(10);

      mockSeoulMetroScraper.scrape.mockResolvedValue([
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '10'
        }
      ]);

      const result = await service.scrape(date);

      // 코레일은 호출되지 않음
      expect(mockKorailScraper.scrape).not.toHaveBeenCalled();
      expect(result.allData.length).toBeGreaterThan(0);
      // 7일 초과로 코레일 생략 → 부분 실패로 처리
      expect(result.hasPartialFailure).toBe(true);
    });

    it('7일 이내: 코레일 실행', async () => {
      // 오늘로부터 3일 전 날짜 (7일 이내 보장)
      const date = getDateString(3);

      mockSeoulMetroScraper.scrape.mockResolvedValue([]);
      mockKorailScraper.scrape.mockResolvedValue([]);

      await service.scrape(date);

      expect(mockKorailScraper.scrape).toHaveBeenCalledWith(date);
    });
  });

  describe('scrape - 에러 처리', () => {
    it('타임아웃 에러: 즉시 예외 발생', async () => {
      const date = getDateString(3);
      const timeoutError = new Error(ERROR_TYPES.TIMEOUT_ERROR);

      mockSeoulMetroScraper.scrape.mockRejectedValue(timeoutError);
      mockKorailScraper.scrape.mockResolvedValue([]);

      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.TIMEOUT_ERROR);
    });

    it('파싱 에러: 즉시 예외 발생', async () => {
      const date = getDateString(3);
      const parsingError = new Error(ERROR_TYPES.PARSING_ERROR);

      mockSeoulMetroScraper.scrape.mockRejectedValue(parsingError);
      mockKorailScraper.scrape.mockResolvedValue([]);

      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('네트워크 에러: 즉시 예외 발생', async () => {
      const date = getDateString(3);
      const networkError = new Error(ERROR_TYPES.NETWORK_ERROR);

      mockSeoulMetroScraper.scrape.mockRejectedValue(networkError);
      mockKorailScraper.scrape.mockResolvedValue([
        {
          site: 'korail',
          line: '경의선',
          direction: '상행선',
          timeRange: '첫차~08시',
          delayMinutes: '10'
        }
      ]);

      // 네트워크 에러는 즉시 예외 발생 (부분 실패 처리 안 함)
      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.NETWORK_ERROR);
    });

    it('두 사이트 모두 실패: NETWORK_ERROR 예외', async () => {
      const date = getDateString(3);
      const networkError = new Error(ERROR_TYPES.NETWORK_ERROR);

      mockSeoulMetroScraper.scrape.mockRejectedValue(networkError);
      mockKorailScraper.scrape.mockRejectedValue(networkError);

      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.NETWORK_ERROR);
    });

    it('서울교통공사 실패, 코레일 성공: 즉시 예외 발생', async () => {
      const date = getDateString(3);
      const networkError = new Error(ERROR_TYPES.NETWORK_ERROR);

      mockSeoulMetroScraper.scrape.mockRejectedValue(networkError);
      mockKorailScraper.scrape.mockResolvedValue([
        {
          site: 'korail',
          line: '경의선',
          direction: '상행선',
          timeRange: '첫차~08시',
          delayMinutes: '10'
        }
      ]);

      // 서울교통공사 네트워크 에러는 즉시 예외 발생 (부분 실패 처리 안 함)
      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.NETWORK_ERROR);
    });

    it('서울교통공사 성공, 코레일 실패: 즉시 예외 발생', async () => {
      const date = getDateString(3);
      const networkError = new Error(ERROR_TYPES.NETWORK_ERROR);

      mockSeoulMetroScraper.scrape.mockResolvedValue([
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '10'
        }
      ]);
      mockKorailScraper.scrape.mockRejectedValue(networkError);

      // 코레일 네트워크 에러는 즉시 예외 발생 (부분 실패 처리 안 함)
      await expect(service.scrape(date)).rejects.toThrow(ERROR_TYPES.NETWORK_ERROR);
    });
  });

  describe('normalize - 데이터 정규화', () => {
    it('정규화: ScrapedDelayInfo → FormattedDelayData', () => {
      const data: ScrapedDelayInfo[] = [
        {
          site: 'seoulmetro',
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayMinutes: '10'
        }
      ];

      const result = service.normalize(data, '20251206');

      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('1호선');
      expect(result[0].delayDate).toBe('251206');
      expect(result[0].delayTime).toBe('10');
    });
  });

  describe('filter - delayTime 필터링', () => {
    it('필터링: minDelayTime 이상만 반환', () => {
      const data: FormattedDelayData[] = [
        {
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '5',
          pdfBase64: ''
        },
        {
          line: '2호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '10',
          pdfBase64: ''
        },
        {
          line: '3호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '15',
          pdfBase64: ''
        }
      ];

      const result = service.filter(data, '10');

      expect(result).toHaveLength(2);
      expect(result[0].delayTime).toBe('10');
      expect(result[1].delayTime).toBe('15');
    });

    it('필터링: 모든 데이터 제외', () => {
      const data: FormattedDelayData[] = [
        {
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '5',
          pdfBase64: ''
        }
      ];

      const result = service.filter(data, '10');

      expect(result).toHaveLength(0);
    });
  });

  describe('formatResponse - 응답 포맷팅', () => {
    it('성공 응답: 데이터 있음', () => {
      const data: FormattedDelayData[] = [
        {
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '10',
          pdfBase64: ''
        }
      ];

      const result = service.formatResponse(data, false);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS.code);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(1);
    });

    it('부분 성공 응답: 부분 실패 있음', () => {
      const data: FormattedDelayData[] = [
        {
          line: '1호선',
          direction: '상행선',
          timeRange: '첫차~09시',
          delayDate: '251206',
          delayStart: '202512060400',
          delayEnd: '202512060900',
          delayTime: '10',
          pdfBase64: ''
        }
      ];

      const result = service.formatResponse(data, true);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS_PARTIAL.code);
    });
  });
});
