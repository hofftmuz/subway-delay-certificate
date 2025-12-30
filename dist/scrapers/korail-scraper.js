"use strict";
/**
 * 코레일 스크래퍼
 *
 * 코레일 간편지연증명서 페이지에서 지연 정보를 스크래핑
 * - URL: https://info.korail.com/mbs/www/neo/delay/delaylist.jsp
 * - Method: POST
 * - 날짜 형식: YYYY-MM-DD
 * - 시간대: 5개 (첫차~08시, 08시~10시, 10시~18시, 18시~22시, 22시~막차)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KorailScraper = void 0;
const cheerio = __importStar(require("cheerio"));
const base_scraper_1 = require("./base-scraper");
const date_converter_1 = require("../utils/date-converter");
const error_types_1 = require("../config/error-types");
class KorailScraper extends base_scraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.url = 'https://info.korail.com/mbs/www/neo/delay/delaylist.jsp';
        this.siteName = 'Korail';
    }
    /**
     * 코레일에서 지연 정보 스크래핑
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑된 지연 정보 배열
     * @throws Error - 타임아웃, 파싱 에러, 네트워크 에러 시 예외 발생
     */
    async scrape(date) {
        const indate = (0, date_converter_1.toKorailFormat)(date);
        const html = await this.executePostRequest(`indate=${indate}`);
        return this.parseHTML(html);
    }
    /**
     * HTML 파싱하여 지연 정보 추출
     *
     * @param html - HTML 문자열
     * @returns 추출된 지연 정보 배열
     * @throws Error - 파싱 에러 시 예외 발생 (테이블 없음, 셀 없음, 노선명 추출 실패)
     */
    parseHTML(html) {
        const $ = cheerio.load(html);
        const rows = $('table.table-bordered tbody tr');
        const delays = [];
        // 파싱 에러 체크: 테이블이 없는 경우
        if (rows.length === 0) {
            throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
        }
        let currentLine = '';
        const timeRanges = [
            '첫차~08시',
            '08시~10시',
            '10시~18시',
            '18시~22시',
            '22시~막차'
        ];
        rows.each((_, row) => {
            const $row = $(row);
            const cells = $row.find('td');
            // 파싱 에러 체크: 셀이 없는 경우
            if (cells.length === 0) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
            }
            // Step 1: rowspan 처리 + <center> 태그 (노선명 추출)
            const lineCell = cells.filter('[rowspan]');
            if (lineCell.length > 0) {
                currentLine = lineCell.find('center').text().trim();
                // 파싱 에러 체크: 필수 노선명 추출 실패
                if (!currentLine) {
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
            }
            // 파싱 에러 체크: 필수 노선명 없음
            if (!currentLine) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
            }
            // Step 2: 방향 추출 (<center> 태그)
            const directionIdx = lineCell.length > 0 ? 1 : 0;
            const direction = cells.eq(directionIdx).find('center').text().trim();
            // 파싱 에러 체크: 필수 방향 없음
            if (!direction) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
            }
            // Step 3: 시간대별 데이터 추출
            cells.slice(directionIdx + 1).each((idx, cell) => {
                const $cell = $(cell);
                const link = $cell.find('a');
                // 빈 셀 체크 (데이터 누락 아님, 지연 없음)
                // <a> 태그가 없거나, 텍스트가 비어있는 경우 스킵
                if (link.length === 0) {
                    return;
                }
                const text = link.text().trim();
                // 텍스트가 비어있는 경우도 빈 셀로 처리 (지연 없음)
                if (!text) {
                    return;
                }
                const match = text.match(/(\d+)분/);
                // 파싱 에러 체크: 필수 지연시간 추출 실패
                // 텍스트가 있지만 "숫자+분" 형식이 아닌 경우만 에러
                if (!match) {
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
                // PDF URL 추출 (href 속성에서 delaylistDetail.jsp URL 구성)
                let pdfUrl;
                const href = link.attr('href');
                if (href) {
                    // 절대 URL인 경우 그대로 사용
                    if (href.startsWith('https://') || href.startsWith('http://')) {
                        pdfUrl = href;
                    }
                    // 상대 경로인 경우 절대 URL로 변환
                    else if (href.includes('delaylistDetail')) {
                        // delaylistDetail.jsp URL인 경우
                        pdfUrl = `https://info.korail.com/mbs/www/neo/delay/${href.startsWith('/') ? href.substring(1) : href}`;
                    }
                }
                delays.push({
                    site: 'korail',
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
exports.KorailScraper = KorailScraper;
//# sourceMappingURL=korail-scraper.js.map