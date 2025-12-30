/**
 * 서울교통공사 스크래퍼
 *
 * 서울교통공사 간편지연증명서 페이지에서 지연 정보를 스크래핑
 * - URL: http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543
 * - Method: POST
 * - 날짜 형식: 0~30 (0=오늘, 1=1일 전, ..., 30=30일 전)
 * - 시간대: 3개 (첫차~09시, 09시~18시, 18시~막차)
 */

import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { ScrapedDelayInfo } from '../types';
import { toSeoulMetroFormat } from '../utils/date-converter';
import { ERROR_TYPES } from '../config/error-types';

export class SeoulMetroScraper extends BaseScraper {
  protected readonly url = 'http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543';
  protected readonly siteName = 'SeoulMetro';

  /**
   * 서울교통공사에서 지연 정보 스크래핑
   *
   * @param date - 조회 날짜 (YYYYMMDD 형식)
   * @returns 스크래핑된 지연 정보 배열
   * @throws Error - 타임아웃, 파싱 에러, 네트워크 에러 시 예외 발생
   */
  async scrape(date: string): Promise<ScrapedDelayInfo[]> {
    const viewDate = toSeoulMetroFormat(date);
    const html = await this.executePostRequest(`view_date=${viewDate}`);
    return this.parseHTML(html);
  }

  /**
   * HTML 파싱하여 지연 정보 추출
   *
   * @param html - HTML 문자열
   * @returns 추출된 지연 정보 배열
   * @throws Error - 파싱 에러 시 예외 발생 (테이블 없음, 셀 없음, 노선명 추출 실패)
   */
  private parseHTML(html: string): ScrapedDelayInfo[] {
    const $ = cheerio.load(html);
    const rows = $('table.tbl-type1 tbody tr');
    const delays: ScrapedDelayInfo[] = [];

    // 파싱 에러 체크: 테이블이 없는 경우
    if (rows.length === 0) {
      throw new Error(ERROR_TYPES.PARSING_ERROR);
    }

    let currentLine = '';
    const timeRanges = ['첫차~09시', '09시~18시', '18시~막차'];

    rows.each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td.ag-c');

      // 파싱 에러 체크: 셀이 없는 경우
      if (cells.length === 0) {
        throw new Error(ERROR_TYPES.PARSING_ERROR);
      }

      // Step 1: rowspan 처리 (노선명 추출)
      const lineCell = cells.filter('[rowspan]');
      if (lineCell.length > 0) {
        currentLine = lineCell.text().trim();

        // 파싱 에러: rowspan 셀은 있지만 노선명 텍스트가 비어있음
        if (!currentLine) {
          throw new Error(ERROR_TYPES.PARSING_ERROR);
        }
      }

      // 파싱 에러: 첫 행에 rowspan이 없어서 노선명을 찾을 수 없음
      // (두 번째 행 이후는 이전 행의 currentLine을 사용하므로 문제 없음)
      if (!currentLine) {
        throw new Error(ERROR_TYPES.PARSING_ERROR);
      }

      // Step 2: 방향 추출
      const directionIdx = lineCell.length > 0 ? 1 : 0;
      const direction = cells.eq(directionIdx).text().trim();

      // 파싱 에러 체크: 필수 방향 없음
      if (!direction) {
        throw new Error(ERROR_TYPES.PARSING_ERROR);
      }

      // Step 3: 시간대별 데이터 추출
      cells.slice(directionIdx + 1).each((idx, cell) => {
        const $cell = $(cell);
        const link = $cell.find('a');

        // 빈 셀 체크 (데이터 누락 아님, 지연 없음)
        if (link.length === 0) {
          return;
        }

        const text = link.text().trim();
        const match = text.match(/(\d+)분/);

        // 파싱 에러 체크: 필수 지연시간 추출 실패
        if (!match) {
          throw new Error(ERROR_TYPES.PARSING_ERROR);
        }

        // PDF URL 추출 (href 속성에서 idxid 추출)
        let pdfUrl: string | undefined;
        const href = link.attr('href');
        if (href) {
          // 절대 URL인 경우 그대로 사용
          if (href.startsWith('https://') || href.startsWith('http://')) {
            pdfUrl = href;
          }
          // 상대 경로인 경우 idxid 추출하여 변환
          else {
            const idxidMatch = href.match(/idxid=(\d+)/);
            if (idxidMatch) {
              pdfUrl = `https://www.seoulmetro.co.kr/kr/delayProofPrint.do?idxid=${idxidMatch[1]}`;
            }
          }
        }

        delays.push({
          site: 'seoulmetro',
          line: currentLine,
          direction,
          timeRange: timeRanges[idx],
          delayMinutes: match[1],
          pdfUrl
        });
      });
    });

    return delays;
  }
}
