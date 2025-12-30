/**
 * 날짜 변환 유틸리티
 *
 * 각 사이트별 날짜 형식으로 변환
 */
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
export declare function toSeoulMetroFormat(date: string): number;
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
export declare function toKorailFormat(date: string): string;
//# sourceMappingURL=date-converter.d.ts.map