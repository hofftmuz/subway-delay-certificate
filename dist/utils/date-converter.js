"use strict";
/**
 * 날짜 변환 유틸리티
 *
 * 각 사이트별 날짜 형식으로 변환
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSeoulMetroFormat = toSeoulMetroFormat;
exports.toKorailFormat = toKorailFormat;
const date_fns_1 = require("date-fns");
/**
 * 서울교통공사용 날짜 형식 변환
 * 서울교통공사는 0~30 숫자를 사용 (0=금일, 1=1일 전, ..., 30=30일 전)
 *
 * @param date - YYYYMMDD 형식 날짜
 * @returns 0~30 숫자 (0=금일, 1=1일 전, ..., 30=30일 전)
 *
 * @example
 * toSeoulMetroFormat("20251206") // 오늘이 2025-12-11이면 → 5
 */
function toSeoulMetroFormat(date) {
    const inputDate = (0, date_fns_1.parse)(date, 'yyyyMMdd', new Date());
    const today = (0, date_fns_1.startOfDay)(new Date());
    const daysAgo = (0, date_fns_1.differenceInDays)(today, (0, date_fns_1.startOfDay)(inputDate));
    // 0~30 범위 체크
    if (daysAgo < 0 || daysAgo > 30) {
        throw new Error(`날짜 범위 오류: ${daysAgo}일 전 (0~30 범위여야 함)`);
    }
    return daysAgo;
}
/**
 * 코레일용 날짜 형식 변환
 * 코레일은 "YYYY-MM-DD" 형식의 문자열을 사용
 *
 * @param date - YYYYMMDD 형식 날짜
 * @returns "YYYY-MM-DD" 형식 문자열
 *
 * @example
 * toKorailFormat("20251206") // → "2025-12-06"
 */
function toKorailFormat(date) {
    const parsedDate = (0, date_fns_1.parse)(date, 'yyyyMMdd', new Date());
    return (0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd');
}
//# sourceMappingURL=date-converter.js.map