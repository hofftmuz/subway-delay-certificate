/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 로직을 제공하는 추상 클래스
 * 모든 스크래퍼가 상속받아 사용
 */
import { AxiosInstance } from 'axios';
import { ScrapedDelayInfo } from '../types';
/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 및 HTTP 요청 로직을 제공
 */
export declare abstract class BaseScraper {
    protected abstract readonly url: string;
    protected abstract readonly siteName: string;
    protected readonly timeout = 10000;
    /**
     * HTTP 클라이언트 인스턴스
     * 공통 헤더와 타임아웃 설정을 포함
     */
    protected readonly httpClient: AxiosInstance;
    constructor();
    /**
     * 지연 정보 스크래핑 (추상 메서드)
     *
     * 각 스크래퍼는 이 메서드를 구현
     */
    abstract scrape(date: string): Promise<ScrapedDelayInfo[]>;
    /**
     * HTTP POST 요청 실행
     *
     * @param body - POST 요청 body (URL encoded 형식)
     * @returns 응답 데이터 (HTML 문자열)
     * @throws Error - 타임아웃, 네트워크 에러 시 예외 발생
     */
    protected executePostRequest(body: string): Promise<string>;
}
//# sourceMappingURL=base-scraper.d.ts.map