/**
 * 시간대 매핑 유틸리티
 *
 * 사이트별 시간대 문자열을 실제 시간 범위로 변환
 */
/**
 * 시간대 매핑
 *
 * 사이트별 시간대 문자열을 실제 시간 범위로 변환
 *
 * @param timeRange - 시간대 문자열 (예: "첫차~09시", "18시~막차")
 * @param site - 사이트 타입 ('seoulmetro' | 'korail')
 * @param date - 기준 날짜 (YYYYMMDD 형식)
 * @returns delayStart, delayEnd (YYYYMMDDHHmm 형식)
 *
 * @example
 * // 예시 1: 막차 시간대 (다음날 02:00까지)
 * mapTimeRange("18시~막차", "seoulmetro", "20251206")
 * // → { delayStart: "202512061800", delayEnd: "202512070200" }
 *
 * // 예시 2: 일반 시간대 (같은 날)
 * mapTimeRange("08시~10시", "korail", "20251206")
 * // → { delayStart: "202512060800", delayEnd: "202512061000" }
 */
export declare function mapTimeRange(timeRange: string, site: 'seoulmetro' | 'korail', date: string): {
    delayStart: string;
    delayEnd: string;
};
//# sourceMappingURL=time-range-mapper.d.ts.map