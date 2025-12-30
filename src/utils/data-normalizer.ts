/**
 * 데이터 정규화 유틸리티
 *
 * ScrapedDelayInfo를 FormattedDelayData로 변환
 * - 날짜/시간 형식 통일 (delayDate: YYMMDD, delayStart/End: YYYYMMDDHHmm)
 * - 시간대 매핑을 통한 실제 시간 범위 계산
 * - PDF Base64 기본값 설정
 */

import { ScrapedDelayInfo, FormattedDelayData } from '../types';
import { mapTimeRange } from './time-range-mapper';
import { format, parse } from 'date-fns';

/**
 * 스크래핑된 지연 정보를 정규화된 형식으로 변환
 *
 * @param data - 스크래핑된 지연 정보 배열
 * @param date - 기준 날짜 (YYYYMMDD 형식)
 * @returns 정규화된 지연 정보 배열
 */
export function normalizeData(
  data: ScrapedDelayInfo[],
  date: string
): FormattedDelayData[] {
  console.log(`[DataNormalizer] 정규화 시작: ${data.length}건`);

  const normalized: FormattedDelayData[] = [];

  for (const item of data) {
    try {
      // 1. 시간대 매핑을 통한 delayStart, delayEnd 계산
      const { delayStart, delayEnd } = mapTimeRange(
        item.timeRange,
        item.site,
        date
      );

      // 2. delayDate 생성 (YYMMDD 형식)
      const baseDate = parse(date, 'yyyyMMdd', new Date());
      const delayDate = format(baseDate, 'yyMMdd');

      // 3. delayTime 설정 (delayMinutes → delayTime)
      const delayTime = item.delayMinutes;

      // 4. 정규화된 데이터 생성 (pdfBase64는 pdfDataYn에 따라 설정)
      normalized.push({
        line: item.line,
        direction: item.direction,
        timeRange: item.timeRange,
        delayDate,
        delayStart,
        delayEnd,
        delayTime
        // pdfBase64 필드는 pdfDataYn에 따라 설정하지 않음
      });
    } catch (error) {
      // 개별 항목 정규화 실패 시 로그만 남기고 스킵
      console.log(`[DataNormalizer] 정규화 실패 (스킵):`, item, error);
    }
  }

  console.log(`[DataNormalizer] 정규화 완료: ${normalized.length}건`);
  return normalized;
}
