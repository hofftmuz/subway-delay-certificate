"use strict";
/**
 * 에러 코드 설정
 *
 * 시스템에서 사용하는 모든 응답 코드와 메시지 정의
 * - 성공 코드: 1000200, 1000204, 1000206
 * - 입력 검증 에러: 1000016, 1000019, 1000103
 * - 네트워크 에러: 1000021, 1000408, 1000031
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = void 0;
/**
 * 성공 응답 코드
 */
const SUCCESS_CODES = {
    /** 정상 처리 (데이터 있음) */
    SUCCESS: {
        code: '1000200',
        msg: '자동연동 성공'
    },
    /** 정상 처리 (데이터 없음) */
    SUCCESS_NO_DATA: {
        code: '1000204',
        msg: '자동연동 성공(내용 없음)'
    },
    /** 부분 성공 (한 사이트만 성공) */
    SUCCESS_PARTIAL: {
        code: '1000206',
        msg: '자동연동 성공(부분 성공)'
    }
};
/**
 * 입력 검증 에러 코드
 */
const VALIDATION_ERROR_CODES = {
    /** 날짜 형식 오류 또는 31일 초과 */
    INVALID_DATE_FORMAT: {
        code: '1000019',
        msg: '조회 시작일 형식이 잘못되었습니다.'
    },
    /** 미래 날짜 */
    FUTURE_DATE: {
        code: '1000016',
        msg: '조회 시작/종료일이 오늘보다 미래입니다.'
    },
    /** 입력값 형식 오류 (음수 delayTime, 잘못된 pdfDataYn 등) */
    INVALID_INPUT: {
        code: '1000103',
        msg: '요청 입력값의 형식이 올바르지 않습니다. 확인 후 다시 시도해 주세요.'
    }
};
/**
 * 네트워크 및 시스템 에러 코드
 */
const SYSTEM_ERROR_CODES = {
    /** 두 사이트 모두 실패 */
    NETWORK_ERROR: {
        code: '1000021',
        msg: '네트워크 에러'
    },
    /** 타임아웃 (10초 초과) */
    TIMEOUT: {
        code: '1000408',
        msg: '자동연동 실패하였습니다. 잠시 후 다시 시도해 주세요.(시간초과)'
    },
    /** 파싱 실패 (HTML 구조 변경 등) */
    PARSING_ERROR: {
        code: '1000031',
        msg: '타깃사이트의 응답 값이 누락되었습니다. 문제가 계속될 경우 고객센터에 문의해 주세요.'
    }
};
/**
 * 전체 에러 코드 통합 객체
 */
exports.ERROR_CODES = {
    ...SUCCESS_CODES,
    ...VALIDATION_ERROR_CODES,
    ...SYSTEM_ERROR_CODES
};
//# sourceMappingURL=error-codes.js.map