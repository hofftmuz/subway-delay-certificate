/**
 * 데이터 정규화 유틸리티
 *
 * ScrapedDelayInfo를 FormattedDelayData로 변환
 * - 날짜/시간 형식 통일 (delayDate: YYMMDD, delayStart/End: YYYYMMDDHHmm)
 * - 시간대 매핑을 통한 실제 시간 범위 계산
 * - PDF Base64 기본값 설정
 */
import { ScrapedDelayInfo, FormattedDelayData } from '../types';
/**
 * 스크래핑된 지연 정보를 정규화된 형식으로 변환
 *
 * @param data - 스크래핑된 지연 정보 배열
 * @param date - 기준 날짜 (YYYYMMDD 형식)
 * @returns 정규화된 지연 정보 배열
 */
export declare function normalizeData(data: ScrapedDelayInfo[], date: string): FormattedDelayData[];
//# sourceMappingURL=data-normalizer.d.ts.map