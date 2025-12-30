/**
 * 코레일 스크래퍼
 *
 * 코레일 간편지연증명서 페이지에서 지연 정보를 스크래핑
 * - URL: https://info.korail.com/mbs/www/neo/delay/delaylist.jsp
 * - Method: POST
 * - 날짜 형식: YYYY-MM-DD
 * - 시간대: 5개 (첫차~08시, 08시~10시, 10시~18시, 18시~22시, 22시~막차)
 */
import { BaseScraper } from './base-scraper';
import { ScrapedDelayInfo } from '../types';
export declare class KorailScraper extends BaseScraper {
    protected readonly url = "https://info.korail.com/mbs/www/neo/delay/delaylist.jsp";
    protected readonly siteName = "Korail";
    /**
     * 코레일에서 지연 정보 스크래핑
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
//# sourceMappingURL=korail-scraper.d.ts.map