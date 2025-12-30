"use strict";
/**
 * 지연 정보 스크래핑 서비스
 *
 * 비즈니스 로직을 담당하는 서비스 레이어
 * - 입력 검증
 * - 스크래퍼 병렬 실행
 * - 데이터 정규화 및 필터링
 * - 응답 포맷팅
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayScraperService = void 0;
const date_fns_1 = require("date-fns");
const types_1 = require("../types");
const input_validator_1 = require("../utils/input-validator");
const seoul_metro_scraper_1 = require("../scrapers/seoul-metro-scraper");
const korail_scraper_1 = require("../scrapers/korail-scraper");
const data_normalizer_1 = require("../utils/data-normalizer");
const response_formatters_1 = require("../utils/response-formatters");
const error_codes_1 = require("../config/error-codes");
const error_types_1 = require("../config/error-types");
const pdf_downloader_1 = require("../utils/pdf-downloader");
/**
 * 지연 정보 스크래핑 서비스
 *
 * 단계별 메서드로 분리하여 테스트 가능하도록 설계
 */
class DelayScraperService {
    constructor() {
        this.seoulMetroScraper = new seoul_metro_scraper_1.SeoulMetroScraper();
        this.korailScraper = new korail_scraper_1.KorailScraper();
    }
    /**
     * 전체 요청 처리 (공개 메서드)
     *
     * @param input - API 입력 데이터
     * @returns API 출력 데이터
     */
    async processRequest(input) {
        // 1. 입력 검증
        const validated = this.validate(input);
        // 2. 스크래핑 실행
        const scrapedData = await this.scrape(validated.inqrDate);
        // 3. 데이터 정규화
        const normalized = this.normalize(scrapedData.allData, validated.inqrDate);
        // 4. delayTime 필터링
        const filtered = this.filter(normalized, validated.delayTime);
        // 5. PDF 처리 (pdfDataYn에 따라)
        if (validated.pdfDataYn === '1') {
            // pdfDataYn="1": PDF 다운로드 실행
            await this.downloadPdfs(filtered, scrapedData.allData);
        }
        // pdfDataYn="0"인 경우: pdfBase64 필드를 설정하지 않음 (필드 자체가 없음)
        // 6. 응답 생성
        return this.formatResponse(filtered, scrapedData.hasPartialFailure);
    }
    /**
     * 입력 검증
     *
     * @param input - API 입력 데이터
     * @returns 검증된 입력 데이터
     * @throws ValidationError - 검증 실패 시
     */
    validate(input) {
        return (0, input_validator_1.validateInput)(input);
    }
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
    async scrape(date) {
        console.log('[Service] 병렬 스크래핑 시작');
        const daysAgo = this.getDaysAgo(date);
        console.log(`[Service] 날짜 범위 체크: ${daysAgo}일 전`);
        // 1. 30일 초과 체크 (예외 발생)
        if (daysAgo > 30) {
            console.log('[Service] 30일 초과 → 예외 발생');
            throw new types_1.ValidationError(error_codes_1.ERROR_CODES.INVALID_DATE_FORMAT.code, error_codes_1.ERROR_CODES.INVALID_DATE_FORMAT.msg);
        }
        // 2. 서울교통공사는 항상 실행 (30일 이내)
        const seoulMetroPromise = this.seoulMetroScraper.scrape(date);
        // 3. 코레일은 7일 체크 (기간 차이로 인한 부분 실패)
        let korailPromise;
        let isKorailSkipped = false;
        if (this.shouldScrapeKorail(date)) {
            console.log('[Service] 7일 이내: 코레일 스크래핑 진행');
            korailPromise = this.korailScraper.scrape(date);
        }
        else {
            console.log('[Service] 7일 초과: 코레일 조회 범위 초과로 출력 불가');
            isKorailSkipped = true;
            korailPromise = Promise.resolve([]);
        }
        // 4. 병렬 실행 + 에러 처리
        const results = await Promise.allSettled([
            seoulMetroPromise,
            korailPromise
        ]);
        const allData = [];
        let hasPartialFailure = false;
        // 서울교통공사 결과 처리
        if (results[0].status === 'fulfilled') {
            allData.push(...results[0].value);
            console.log(`[Service] 서울교통공사 성공: ${results[0].value.length}건`);
        }
        else {
            const error = results[0].reason;
            console.error('[Service] 서울교통공사 실패:', error);
            // 타임아웃 에러는 즉시 예외 발생
            if (error instanceof Error) {
                if (error.message === error_types_1.ERROR_TYPES.TIMEOUT_ERROR) {
                    throw new Error(error_types_1.ERROR_TYPES.TIMEOUT_ERROR);
                }
                // 네트워크 에러는 즉시 예외 발생
                if (error.message === error_types_1.ERROR_TYPES.NETWORK_ERROR ||
                    error.message === error_types_1.ERROR_TYPES.SERVER_ERROR ||
                    error.message === error_types_1.ERROR_TYPES.CONNECTION_REFUSED) {
                    throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
                }
                // 파싱 에러는 즉시 예외 발생
                if (error.message === error_types_1.ERROR_TYPES.PARSING_ERROR) {
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
                else {
                    // 기타 에러도 네트워크 에러로 처리
                    throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
                }
            }
            else {
                // 기타 에러도 네트워크 에러로 처리
                throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
            }
        }
        // 코레일 결과 처리
        if (results[1].status === 'fulfilled') {
            allData.push(...results[1].value);
            console.log(`[Service] 코레일 성공: ${results[1].value.length}건`);
            // 7일 초과로 생략된 경우 → 부분 실패 처리
            if (isKorailSkipped) {
                console.log('[Service] 코레일 조회 범위 초과로 출력 불가 (부분 실패)');
                hasPartialFailure = true;
            }
        }
        else if (this.shouldScrapeKorail(date)) {
            // 7일 이내였는데 실패한 경우만 처리
            const error = results[1].reason;
            console.error('[Service] 코레일 실패:', error);
            // 타임아웃 에러는 즉시 예외 발생
            if (error instanceof Error) {
                if (error.message === error_types_1.ERROR_TYPES.TIMEOUT_ERROR) {
                    throw new Error(error_types_1.ERROR_TYPES.TIMEOUT_ERROR);
                }
                // 네트워크 에러는 즉시 예외 발생
                if (error.message === error_types_1.ERROR_TYPES.NETWORK_ERROR ||
                    error.message === error_types_1.ERROR_TYPES.SERVER_ERROR ||
                    error.message === error_types_1.ERROR_TYPES.CONNECTION_REFUSED) {
                    throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
                }
                // 파싱 에러는 즉시 예외 발생
                if (error.message === error_types_1.ERROR_TYPES.PARSING_ERROR) {
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
                else {
                    // 기타 에러도 네트워크 에러로 처리
                    throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
                }
            }
            else {
                // 기타 에러도 네트워크 에러로 처리
                throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
            }
        }
        // 5. 두 사이트 모두 실패 체크
        if (allData.length === 0 && hasPartialFailure) {
            console.error('[Service] 두 사이트 모두 실패 → NETWORK_ERROR');
            throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
        }
        console.log(`[Service] 스크래핑 완료: ${allData.length}건, 부분 실패: ${hasPartialFailure}`);
        return {
            allData,
            hasPartialFailure
        };
    }
    /**
     * 데이터 정규화
     *
     * @param data - 스크래핑된 지연 정보 배열
     * @param date - 기준 날짜 (YYYYMMDD 형식)
     * @returns 정규화된 지연 정보 배열
     */
    normalize(data, date) {
        return (0, data_normalizer_1.normalizeData)(data, date);
    }
    /**
     * delayTime 필터링
     *
     * @param data - 정규화된 지연 정보 배열
     * @param minDelayTime - 최소 지연시간 (분, 문자열)
     * @returns 필터링된 지연 정보 배열
     */
    filter(data, minDelayTime) {
        const minDelay = parseInt(minDelayTime, 10);
        return data.filter(item => parseInt(item.delayTime, 10) >= minDelay);
    }
    /**
     * 응답 포맷팅
     *
     * @param data - 필터링된 지연 정보 배열
     * @param hasPartialFailure - 부분 실패 여부
     * @returns API 출력 데이터
     */
    formatResponse(data, hasPartialFailure) {
        return (0, response_formatters_1.createSuccessResponse)(data, hasPartialFailure);
    }
    /**
     * 날짜로부터 며칠 전인지 계산(헬퍼 메서드)
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 며칠 전인지 (0 = 오늘, 1 = 1일 전, ...)
     */
    getDaysAgo(date) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const inputDate = (0, date_fns_1.parse)(date, 'yyyyMMdd', new Date());
        return (0, date_fns_1.differenceInDays)(today, (0, date_fns_1.startOfDay)(inputDate));
    }
    /**
     * 코레일 스크래핑 여부 판단 (헬퍼 메서드)
     *
     * 코레일은 7일 이내만 스크래핑
     * 7일 초과면 생략 (기간 차이로 인한 부분 실패로 처리)
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑 여부 (true = 실행, false = 생략)
     */
    shouldScrapeKorail(date) {
        const daysAgo = this.getDaysAgo(date);
        return daysAgo <= 7;
    }
    /**
     * PDF 다운로드 및 Base64 인코딩
     *
     * 각 항목의 pdfUrl이 있으면 PDF를 다운로드하여 pdfBase64 필드에 저장
     * 실패 시 빈 문자열로 설정 (시스템 중단 방지)
     *
     * @param formattedData - 포맷팅된 지연 정보 배열 (pdfBase64 필드 업데이트)
     * @param scrapedData - 스크래핑된 원본 데이터 (pdfUrl 포함)
     */
    async downloadPdfs(formattedData, scrapedData) {
        console.log('[Service] PDF 다운로드 시작');
        // formattedData와 scrapedData를 매칭하기 위한 맵 생성
        const pdfUrlMap = new Map();
        scrapedData.forEach(item => {
            if (item.pdfUrl) {
                // line + direction + timeRange를 키로 사용
                const key = `${item.line}|${item.direction}|${item.timeRange}`;
                pdfUrlMap.set(key, item.pdfUrl);
            }
        });
        // PDF URL이 있는 항목만 필터링
        const pdfItems = [];
        formattedData.forEach((item, index) => {
            const key = `${item.line}|${item.direction}|${item.timeRange}`;
            const pdfUrl = pdfUrlMap.get(key);
            if (pdfUrl) {
                // site 정보는 URL에서 추출
                const site = pdfUrl.includes('seoulmetro') ? 'seoulmetro' : 'korail';
                pdfItems.push({ index, url: pdfUrl, site });
            }
        });
        if (pdfItems.length === 0) {
            console.log('[Service] PDF 다운로드할 항목 없음');
            return;
        }
        console.log(`[Service] PDF 다운로드 대상: ${pdfItems.length}건`);
        // 병렬로 PDF 다운로드
        const pdfResults = await (0, pdf_downloader_1.downloadMultiplePdfs)(pdfItems.map(({ url, site }) => ({ url, site })));
        // 결과를 formattedData에 반영
        pdfItems.forEach(({ index }, i) => {
            const pdfBase64 = pdfResults[i];
            if (pdfBase64 && pdfBase64.trim() !== '') {
                // 성공: Base64 문자열 설정
                formattedData[index].pdfBase64 = pdfBase64;
            }
            else {
                // 실패: 빈 문자열 설정 및 로그
                formattedData[index].pdfBase64 = '';
                console.warn(`[Service] PDF 다운로드 실패: ${formattedData[index].line} ${formattedData[index].direction} ${formattedData[index].timeRange}`);
            }
        });
        const successCount = pdfResults.filter(r => r && r.trim() !== '').length;
        const failureCount = pdfItems.length - successCount;
        console.log(`[Service] PDF 다운로드 완료: ${successCount}/${pdfItems.length}건 성공${failureCount > 0 ? `, ${failureCount}건 실패` : ''}`);
    }
}
exports.DelayScraperService = DelayScraperService;
//# sourceMappingURL=delay-scraper-service.js.map