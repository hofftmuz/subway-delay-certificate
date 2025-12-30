/**
 * 에러 타입 상수
 *
 * 스크래퍼에서 발생하는 에러 타입을 상수로 정의
 */
import { ERROR_CODES } from './error-codes';
/**
 * 스크래핑 에러 타입
 */
export declare const ERROR_TYPES: {
    /** 파싱 에러 (HTML 구조 변경 등) */
    readonly PARSING_ERROR: "PARSING_ERROR";
    /** 타임아웃 에러 (10초 초과) */
    readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
    /** 네트워크 에러 (연결 실패, DNS 오류 등) */
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    /** 서버 에러 (5xx) */
    readonly SERVER_ERROR: "SERVER_ERROR";
    /** 연결 거부 에러 */
    readonly CONNECTION_REFUSED: "CONNECTION_REFUSED";
};
/**
 * 에러 타입 값 타입
 */
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
/**
 * 에러 타입을 에러 코드로 변환
 *
 * @param errorType - 에러 타입 (ERROR_TYPES)
 * @returns 에러 코드 객체 { code, msg }
 */
export declare function getErrorCode(errorType: ErrorType): typeof ERROR_CODES[keyof typeof ERROR_CODES];
/**
 * 에러 메시지에서 에러 타입 추출
 *
 * @param errorMessage - 에러 메시지 문자열
 * @returns 에러 타입 또는 null
 */
export declare function getErrorTypeFromMessage(errorMessage: string): ErrorType | null;
//# sourceMappingURL=error-types.d.ts.map