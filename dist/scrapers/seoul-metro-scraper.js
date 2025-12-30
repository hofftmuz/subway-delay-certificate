"use strict";
/**
 * 서울교통공사 스크래퍼
 *
 * 서울교통공사 간편지연증명서 페이지에서 지연 정보를 스크래핑
 * - URL: http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543
 * - Method: POST
 * - 날짜 형식: 0~30 (0=오늘, 1=1일 전, ..., 30=30일 전)
 * - 시간대: 3개 (첫차~09시, 09시~18시, 18시~막차)
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
exports.SeoulMetroScraper = void 0;
const cheerio = __importStar(require("cheerio"));
const base_scraper_1 = require("./base-scraper");
const date_converter_1 = require("../utils/date-converter");
const error_types_1 = require("../config/error-types");
class SeoulMetroScraper extends base_scraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.url = 'http://www.seoulmetro.co.kr/kr/delayProofList.do?menuIdx=543';
        this.siteName = 'SeoulMetro';
    }
    /**
     * 서울교통공사에서 지연 정보 스크래핑
     *
     * @param date - 조회 날짜 (YYYYMMDD 형식)
     * @returns 스크래핑된 지연 정보 배열
     * @throws Error - 타임아웃, 파싱 에러, 네트워크 에러 시 예외 발생
     */
    async scrape(date) {
        const viewDate = (0, date_converter_1.toSeoulMetroFormat)(date);
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
    parseHTML(html) {
        const $ = cheerio.load(html);
        const rows = $('table.tbl-type1 tbody tr');
        const delays = [];
        // 파싱 에러 체크: 테이블이 없는 경우
        if (rows.length === 0) {
            throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
        }
        let currentLine = '';
        const timeRanges = ['첫차~09시', '09시~18시', '18시~막차'];
        rows.each((_, row) => {
            const $row = $(row);
            const cells = $row.find('td.ag-c');
            // 파싱 에러 체크: 셀이 없는 경우
            if (cells.length === 0) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
            }
            // Step 1: rowspan 처리 (노선명 추출)
            const lineCell = cells.filter('[rowspan]');
            if (lineCell.length > 0) {
                currentLine = lineCell.text().trim();
                // 파싱 에러: rowspan 셀은 있지만 노선명 텍스트가 비어있음
                if (!currentLine) {
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
            }
            // 파싱 에러: 첫 행에 rowspan이 없어서 노선명을 찾을 수 없음
            // (두 번째 행 이후는 이전 행의 currentLine을 사용하므로 문제 없음)
            if (!currentLine) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
            }
            // Step 2: 방향 추출
            const directionIdx = lineCell.length > 0 ? 1 : 0;
            const direction = cells.eq(directionIdx).text().trim();
            // 파싱 에러 체크: 필수 방향 없음
            if (!direction) {
                throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
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
                    throw new Error(error_types_1.ERROR_TYPES.PARSING_ERROR);
                }
                // PDF URL 추출 (href 속성에서 idxid 추출)
                let pdfUrl;
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
exports.SeoulMetroScraper = SeoulMetroScraper;
//# sourceMappingURL=seoul-metro-scraper.js.map