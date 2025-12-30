/**
 * 서울교통공사 스크래퍼
 *
 * 서울교통공사 간편지연증명서 페이지에서 지연 정보를 스크래핑
 * - URL: http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543
 * - Method: POST
 * - 날짜 형식: 0~30 (0=오늘, 1=1일 전, ..., 30=30일 전)
 * - 시간대: 3개 (첫차~09시, 09시~18시, 18시~막차)
 */
import { BaseScraper } from './base-scraper';
import { ScrapedDelayInfo } from '../types';
export declare class SeoulMetroScraper extends BaseScraper {
    protected readonly url = "http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543";
    protected readonly siteName = "SeoulMetro";
    /**
     * 서울교통공사에서 지연 정보 스크래핑
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑된 지연 정보 배열
     * @throws Error - 타임아웃, 파싱 에러, 네트워크 에러 시 예외 발생
     */
    scrape(date: string): Promise<ScrapedDelayInfo[]>;
    /**
     * HTML 파싱하여 지연 정보 추출
     *
     * @param html - HTML 문자열
     * @returns 추출된 지연 정보 배열
     * @throws Error - 파싱 에러 시 예외 발생 (테이블 없음, 셀 없음, 노선명 추출 실패)
     */
    private parseHTML;
}
//# sourceMappingURL=seoul-metro-scraper.d.ts.map