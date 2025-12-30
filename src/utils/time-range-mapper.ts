/**
 * 시간대 매핑 유틸리티
 *
 * 사이트별 시간대 문자열을 실제 시간 범위로 변환
 */

import { parse, addDays, format } from 'date-fns';
import { SEOUL_METRO_TIME_RANGES, KORAIL_TIME_RANGES } from '../config/time-range-mappings';

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
export function mapTimeRange(
  timeRange: string,
  site: 'seoulmetro' | 'korail',
  date: string
): { delayStart: string; delayEnd: string } {
  // 1. site에 따라 매핑 선택
  const timeRanges = site === 'seoulmetro'
    ? SEOUL_METRO_TIME_RANGES
    : KORAIL_TIME_RANGES;

  // 2. timeRange로 매핑 조회
  const mapping = timeRanges[timeRange];
  if (!mapping) {
    throw new Error(`알 수 없는 시간대: ${timeRange} (사이트: ${site})`);
  }

  // 3. 기준 날짜 파싱
  const baseDate = parse(date, 'yyyyMMdd', new Date());

  // 4. delayStart 계산 (같은날 + startHour)
  const startDate = new Date(baseDate);
  startDate.setHours(mapping.startHour, 0, 0, 0);
  const delayStart = format(startDate, 'yyyyMMddHHmm');

  // 5. delayEnd 계산
  let endDate: Date;
  if (mapping.nextDay) {
    // 막차 시간대: 다음날 + endHour
    endDate = addDays(baseDate, 1);
    endDate.setHours(mapping.endHour, 0, 0, 0);
  } else {
    // 일반 시간대: 같은날 + endHour
    endDate = new Date(baseDate);
    endDate.setHours(mapping.endHour, 0, 0, 0);
  }
  const delayEnd = format(endDate, 'yyyyMMddHHmm');

  return {
    delayStart,
    delayEnd
  };
}
