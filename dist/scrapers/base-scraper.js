"use strict";
/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 로직을 제공하는 추상 클래스
 * 모든 스크래퍼가 상속받아 사용
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const http_config_1 = require("../config/http-config");
const error_types_1 = require("../config/error-types");
const axios_error_handler_1 = require("../utils/axios-error-handler");
/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 및 HTTP 요청 로직을 제공
 */
class BaseScraper {
    constructor() {
        this.timeout = http_config_1.HTTP_TIMEOUT;
        this.httpClient = axios_1.default.create({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': http_config_1.USER_AGENT,
            },
            timeout: http_config_1.HTTP_TIMEOUT,
        });
    }
    /**
     * HTTP POST 요청 실행
     *
     * @param body - POST 요청 body (URL encoded 형식)
     * @returns 응답 데이터 (HTML 문자열)
     * @throws Error - 타임아웃, 네트워크 에러 시 예외 발생
     */
    async executePostRequest(body) {
        try {
            const response = await this.httpClient.post(this.url, body);
            return response.data;
        }
        catch (error) {
            // AxiosError 처리 (타임아웃, 연결 거부, 서버 에러 등)
            if ((0, axios_error_handler_1.isAxiosError)(error)) {
                (0, axios_error_handler_1.handleAxiosError)(error, this.siteName);
            }
            // AxiosError가 아닌 기타 에러는 네트워크 에러로 처리
            console.error(`[${this.siteName}] 예상치 못한 에러 발생:`, error);
            throw new Error(error_types_1.ERROR_TYPES.NETWORK_ERROR);
        }
    }
}
exports.BaseScraper = BaseScraper;
//# sourceMappingURL=base-scraper.js.map