/**
 * 시간대 매핑 설정
 *
 * 각 사이트별 시간대 문자열을 시간 설정으로 매핑하는 정보
 * - 서울교통공사: 3개 시간대
 * - 코레일: 5개 시간대
 * - 막차 시간대는 다음날 02:00로 처리
 */
import { TimeRangeMapping } from '../types';
/**
 * 서울교통공사 시간대 매핑
 *
 * 시간대 문자열 → 시간 설정 매핑
 * - 첫차~09시: 04:00 ~ 09:00
 * - 09시~18시: 09:00 ~ 18:00
 * - 18시~막차: 18:00 ~ 다음날 02:00
 */
export declare const SEOUL_METRO_TIME_RANGES: Record<string, TimeRangeMapping>;
/**
 * 코레일 시간대 매핑
 *
 * 시간대 문자열 → 시간 설정 매핑
 * - 첫차~08시: 04:00 ~ 08:00
 * - 08시~10시: 08:00 ~ 10:00
 * - 10시~18시: 10:00 ~ 18:00
 * - 18시~22시: 18:00 ~ 22:00
 * - 22시~막차: 22:00 ~ 다음날 02:00
 */
export declare const KORAIL_TIME_RANGES: Record<string, TimeRangeMapping>;
//# sourceMappingURL=time-range-mappings.d.ts.map