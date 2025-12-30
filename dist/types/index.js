"use strict";
/**
 * 타입 정의 모듈
 *
 * 시스템에서 사용하는 TypeScript 타입 정의
 * - Input/Output DTO: API 입출력 형식
 * - Internal Types: 내부 처리용 타입
 * - Error Types: 에러 처리용 타입
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
// ========== Error Types ==========
/**
 * 입력 검증 에러
 *
 * 입력 데이터 검증 실패 시 발생하는 에러
 *
 * @property code - 에러 코드 (예: "1000016")
 * @property message - 에러 메시지
 */
class ValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=index.js.map