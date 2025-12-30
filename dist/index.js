"use strict";
/**
 * 메인 진입점
 *
 * API 요청을 처리하는 핸들러 함수
 * - 입력 검증
 * - 서비스 호출
 * - 에러 처리 및 응답 생성
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const types_1 = require("./types");
const delay_scraper_service_1 = require("./services/delay-scraper-service");
const response_formatters_1 = require("./utils/response-formatters");
const error_codes_1 = require("./config/error-codes");
const error_types_1 = require("./config/error-types");
/**
 * 메인 핸들러 함수
 *
 * Node.js 서버 함수 형식으로 작성
 *
 * @param input - API 입력 데이터
 * @returns API 출력 데이터
 */
async function handler(input) {
    try {
        console.log('[Handler] 요청 시작:', JSON.stringify(input));
        const service = new delay_scraper_service_1.DelayScraperService();
        const result = await service.processRequest(input);
        console.log('[Handler] 요청 완료:', result.out.code);
        return result;
    }
    catch (error) {
        console.error('[Handler] 에러 발생:', error);
        return handleError(error);
    }
}
/**
 * 에러 처리
 *
 * 에러 타입에 따라 적절한 응답 코드 반환
 *
 * @param error - 발생한 에러
 * @returns 에러 응답
 */
function handleError(error) {
    // 입력 검증 에러
    if (error instanceof types_1.ValidationError) {
        return (0, response_formatters_1.createErrorResponse)(error.code, error.message);
    }
    // Error 인스턴스인 경우
    if (error instanceof Error) {
        // 타임아웃 에러
        if (error.message === error_types_1.ERROR_TYPES.TIMEOUT_ERROR) {
            return (0, response_formatters_1.createErrorResponse)(error_codes_1.ERROR_CODES.TIMEOUT.code, error_codes_1.ERROR_CODES.TIMEOUT.msg);
        }
        // 파싱 에러
        if (error.message === error_types_1.ERROR_TYPES.PARSING_ERROR) {
            return (0, response_formatters_1.createErrorResponse)(error_codes_1.ERROR_CODES.PARSING_ERROR.code, error_codes_1.ERROR_CODES.PARSING_ERROR.msg);
        }
        // 네트워크 에러
        if (error.message === error_types_1.ERROR_TYPES.NETWORK_ERROR) {
            return (0, response_formatters_1.createErrorResponse)(error_codes_1.ERROR_CODES.NETWORK_ERROR.code, error_codes_1.ERROR_CODES.NETWORK_ERROR.msg);
        }
    }
    // 알 수 없는 에러 (기본값: 네트워크 에러)
    console.error('[Handler] 알 수 없는 에러:', error);
    return (0, response_formatters_1.createErrorResponse)(error_codes_1.ERROR_CODES.NETWORK_ERROR.code, error_codes_1.ERROR_CODES.NETWORK_ERROR.msg);
}
// 터미널에서 직접 실행할 때 사용
if (require.main === module) {
    (async () => {
        try {
            const fs = require('fs');
            // 파일 경로를 인자로 받거나, stdin에서 읽기
            let inputData;
            if (process.argv[2]) {
                // 파일 경로가 제공된 경우
                const filePath = process.argv[2];
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                inputData = JSON.parse(fileContent);
            }
            else {
                // stdin에서 읽기 (방식 2: process.stdin 직접 읽기)
                const chunks = [];
                for await (const chunk of process.stdin) {
                    chunks.push(chunk);
                }
                const input = Buffer.concat(chunks).toString('utf-8');
                if (!input.trim()) {
                    console.error('에러: 입력 데이터가 없습니다.');
                    console.log('사용법: node dist/index.js input.json');
                    console.log('   또는: cat input.json | node dist/index.js');
                    process.exit(1);
                }
                inputData = JSON.parse(input);
            }
            const result = await handler(inputData);
            console.log(JSON.stringify(result, null, 2));
        }
        catch (error) {
            console.error('에러 발생:', error);
            if (error instanceof Error) {
                console.error('에러 메시지:', error.message);
                if (error.stack) {
                    console.error('스택 트레이스:', error.stack);
                }
            }
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=index.js.map