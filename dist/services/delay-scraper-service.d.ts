/**
 * 지연 정보 스크래핑 서비스
 *
 * 비즈니스 로직을 담당하는 서비스 레이어
 * - 입력 검증
 * - 스크래퍼 병렬 실행
 * - 데이터 정규화 및 필터링
 * - 응답 포맷팅
 */
import { InputDTO, ValidatedInput, ScrapedDelayInfo, FormattedDelayData, OutputDTO } from '../types';
/**
 * 스크래핑 결과
 */
interface ScrapeResult {
    allData: ScrapedDelayInfo[];
    hasPartialFailure: boolean;
}
/**
 * 지연 정보 스크래핑 서비스
 *
 * 단계별 메서드로 분리하여 테스트 가능하도록 설계
 */
export declare class DelayScraperService {
    private seoulMetroScraper;
    private korailScraper;
    constructor();
    /**
     * 전체 요청 처리 (공개 메서드)
     *
     * @param input - API 입력 데이터
     * @returns API 출력 데이터
     */
    processRequest(input: InputDTO): Promise<OutputDTO>;
    /**
     * 입력 검증
     *
     * @param input - API 입력 데이터
     * @returns 검증된 입력 데이터
     * @throws ValidationError - 검증 실패 시
     */
    validate(input: InputDTO): ValidatedInput;
    /**
     * 스크래핑 실행
     *
     * 병렬로 두 사이트를 스크래핑하고 에러 처리
     * - 30일 초과: ValidationError 발생
     * - 7일 초과: 코레일 생략 (부분 실패로 처리)
     * - 타임아웃 에러: 즉시 예외 발생
     * - 네트워크 에러: 즉시 예외 발생
     * - 파싱 에러: 즉시 예외 발생
     * - 두 사이트 모두 실패: NETWORK_ERROR 예외
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑 결과 (데이터 + 부분 실패 여부)
     * @throws ValidationError - 30일 초과 시
     * @throws Error - TIMEOUT_ERROR, NETWORK_ERROR, PARSING_ERROR
     */
    scrape(date: string): Promise<ScrapeResult>;
    /**
     * 데이터 정규화
     *
     * @param data - 스크래핑된 지연 정보 배열
     * @param date - 기준 날짜 (YYYYMMDD 형식)
     * @returns 정규화된 지연 정보 배열
     */
    normalize(data: ScrapedDelayInfo[], date: string): FormattedDelayData[];
    /**
     * delayTime 필터링
     *
     * @param data - 정규화된 지연 정보 배열
     * @param minDelayTime - 최소 지연시간 (분, 문자열)
     * @returns 필터링된 지연 정보 배열
     */
    filter(data: FormattedDelayData[], minDelayTime: string): FormattedDelayData[];
    /**
     * 응답 포맷팅
     *
     * @param data - 필터링된 지연 정보 배열
     * @param hasPartialFailure - 부분 실패 여부
     * @returns API 출력 데이터
     */
    formatResponse(data: FormattedDelayData[], hasPartialFailure: boolean): OutputDTO;
    /**
     * 날짜로부터 며칠 전인지 계산(헬퍼 메서드)
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 며칠 전인지 (0 = 오늘, 1 = 1일 전, ...)
     */
    private getDaysAgo;
    /**
     * 코레일 스크래핑 여부 판단 (헬퍼 메서드)
     *
     * 코레일은 7일 이내만 스크래핑
     * 7일 초과면 생략 (기간 차이로 인한 부분 실패로 처리)
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑 여부 (true = 실행, false = 생략)
     */
    private shouldScrapeKorail;
    /**
     * PDF 다운로드 및 Base64 인코딩
     *
     * 각 항목의 pdfUrl이 있으면 PDF를 다운로드하여 pdfBase64 필드에 저장
     * 실패 시 빈 문자열로 설정 (시스템 중단 방지)
     *
     * @param formattedData - 포맷팅된 지연 정보 배열 (pdfBase64 필드 업데이트)
     * @param scrapedData - 스크래핑된 원본 데이터 (pdfUrl 포함)
     */
    private downloadPdfs;
}
export {};
//# sourceMappingURL=delay-scraper-service.d.ts.map