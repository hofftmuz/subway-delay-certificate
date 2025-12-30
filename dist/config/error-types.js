"use strict";
/**
 * 에러 타입 상수
 *
 * 스크래퍼에서 발생하는 에러 타입을 상수로 정의
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_TYPES = void 0;
exports.getErrorCode = getErrorCode;
exports.getErrorTypeFromMessage = getErrorTypeFromMessage;
const error_codes_1 = require("./error-codes");
/**
 * 스크래핑 에러 타입
 */
exports.ERROR_TYPES = {
    /** 파싱 에러 (HTML 구조 변경 등) */
    PARSING_ERROR: 'PARSING_ERROR',
    /** 타임아웃 에러 (10초 초과) */
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    /** 네트워크 에러 (연결 실패, DNS 오류 등) */
    NETWORK_ERROR: 'NETWORK_ERROR',
    /** 서버 에러 (5xx) */
    SERVER_ERROR: 'SERVER_ERROR',
    /** 연결 거부 에러 */
    CONNECTION_REFUSED: 'CONNECTION_REFUSED',
};
/**
 * 에러 타입과 에러 코드 매핑
 *
 * 스크래퍼에서 발생한 에러 타입을 ERROR_CODES의 실제 응답 코드로 변환
 */
const ERROR_TYPE_TO_CODE_MAP = {
    [exports.ERROR_TYPES.PARSING_ERROR]: error_codes_1.ERROR_CODES.PARSING_ERROR,
    [exports.ERROR_TYPES.TIMEOUT_ERROR]: error_codes_1.ERROR_CODES.TIMEOUT,
    [exports.ERROR_TYPES.NETWORK_ERROR]: error_codes_1.ERROR_CODES.NETWORK_ERROR,
    [exports.ERROR_TYPES.SERVER_ERROR]: error_codes_1.ERROR_CODES.NETWORK_ERROR, // 서버 에러도 네트워크 에러로 처리
    [exports.ERROR_TYPES.CONNECTION_REFUSED]: error_codes_1.ERROR_CODES.NETWORK_ERROR, // 연결 거부도 네트워크 에러로 처리
};
/**
 * 에러 타입을 에러 코드로 변환
 *
 * @param errorType - 에러 타입 (ERROR_TYPES)
 * @returns 에러 코드 객체 { code, msg }
 */
function getErrorCode(errorType) {
    return ERROR_TYPE_TO_CODE_MAP[errorType];
}
/**
 * 에러 메시지에서 에러 타입 추출
 *
 * @param errorMessage - 에러 메시지 문자열
 * @returns 에러 타입 또는 null
 */
function getErrorTypeFromMessage(errorMessage) {
    const errorType = Object.values(exports.ERROR_TYPES).find(type => type === errorMessage);
    return errorType || null;
}
//# sourceMappingURL=error-types.js.map