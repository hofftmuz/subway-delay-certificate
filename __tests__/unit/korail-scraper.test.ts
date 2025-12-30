/**
 * KorailScraper 단위 테스트
 *
 * HTML 파싱 로직의 모든 케이스 테스트 (Mock 기반)
 */

import { KorailScraper } from '../../src/scrapers/korail-scraper';
import axios from 'axios';
import { ERROR_TYPES } from '../../src/config/error-types';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KorailScraper', () => {
  let scraper: KorailScraper;

  beforeEach(() => {
    scraper = new KorailScraper();
    jest.clearAllMocks();
    
    // httpClient.post 모킹
    (scraper as any).httpClient = {
      post: jest.fn()
    };
  });

  describe('scrape - 정상 케이스', () => {
    it('정상 HTML 파싱: 단일 노선, 단일 시간대', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>경의선</center></td>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      const result = await scraper.scrape('20251206');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        site: 'korail',
        line: '경의선',
        direction: '상행선',
        timeRange: '첫차~08시',
        delayMinutes: '5'
      });
    });

    it('정상 HTML 파싱: 단일 노선, 여러 시간대', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>경의선</center></td>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
              <td><a>10분</a></td>
              <td><a>15분</a></td>
              <td><a>20분</a></td>
              <td><a>25분</a></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      const result = await scraper.scrape('20251206');

      expect(result).toHaveLength(5);
      expect(result[0].timeRange).toBe('첫차~08시');
      expect(result[1].timeRange).toBe('08시~10시');
      expect(result[2].timeRange).toBe('10시~18시');
      expect(result[3].timeRange).toBe('18시~22시');
      expect(result[4].timeRange).toBe('22시~막차');
    });

    it('정상 HTML 파싱: 여러 노선, rowspan 처리', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="2"><center>경의선</center></td>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><center>하행선</center></td>
              <td></td>
              <td><a>10분</a></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      const result = await scraper.scrape('20251206');

      expect(result).toHaveLength(2);
      expect(result[0].line).toBe('경의선');
      expect(result[0].direction).toBe('상행선');
      expect(result[0].timeRange).toBe('첫차~08시');
      expect(result[1].line).toBe('경의선');
      expect(result[1].direction).toBe('하행선');
      expect(result[1].timeRange).toBe('08시~10시');
    });

    it('정상 HTML 파싱: 빈 셀 처리 (지연 없음)', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>경의선</center></td>
              <td><center>상행선</center></td>
              <td></td>
              <td><a>10분</a></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td rowspan="1"><center>수인선</center></td>
              <td><center>하행선</center></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      const result = await scraper.scrape('20251206');

      // 빈 셀은 스킵되므로 1건만 반환 (경의선 상행선 08시~10시)
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('경의선');
      expect(result[0].timeRange).toBe('08시~10시');
    });

    it('정상 HTML 파싱: <center> 태그 내부 텍스트 추출', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>수인선</center></td>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      const result = await scraper.scrape('20251206');

      expect(result[0].line).toBe('수인선');
      expect(result[0].direction).toBe('상행선');
    });
  });

  describe('scrape - 파싱 에러 케이스', () => {
    it('파싱 에러: 테이블 없음', async () => {
      const mockHTML = '<html><body></body></html>';

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: tbody 없음', async () => {
      const mockHTML = '<table class="table-bordered"></table>';

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: 셀 없음', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr></tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: 노선명 없음 (rowspan 있지만 <center> 텍스트 없음)', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center></center></td>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: 노선명 없음 (rowspan 없고 이전 rowspan도 없음)', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td><center>상행선</center></td>
              <td><a>5분</a></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: 방향 없음 (<center> 텍스트 없음)', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>경의선</center></td>
              <td><center></center></td>
              <td><a>5분</a></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });

    it('파싱 에러: 지연시간 형식 오류 (숫자 없음)', async () => {
      const mockHTML = `
        <table class="table-bordered">
          <tbody>
            <tr>
              <td rowspan="1"><center>경의선</center></td>
              <td><center>상행선</center></td>
              <td><a>분</a></td>
            </tr>
          </tbody>
        </table>
      `;

      (scraper as any).httpClient.post.mockResolvedValue({ data: mockHTML });

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.PARSING_ERROR);
    });
  });

  describe('scrape - 네트워크 에러 케이스', () => {
    it('타임아웃 에러', async () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout'
      };

      (scraper as any).httpClient.post.mockRejectedValue(axiosError);

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.TIMEOUT_ERROR);
    });

    it('네트워크 에러', async () => {
      const axiosError = {
        isAxiosError: true,
        code: 'ENOTFOUND',
        message: 'DNS lookup failed'
      };

      (scraper as any).httpClient.post.mockRejectedValue(axiosError);

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.NETWORK_ERROR);
    });

    it('서버 에러 (5xx)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500
        }
      };

      (scraper as any).httpClient.post.mockRejectedValue(axiosError);

      await expect(scraper.scrape('20251206')).rejects.toThrow(ERROR_TYPES.SERVER_ERROR);
    });
  });
});
