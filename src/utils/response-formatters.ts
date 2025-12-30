/**
 * 응답 포맷팅 유틸리티
 *
 * 스크래핑 결과를 API 응답 형식으로 변환
 */

import { ERROR_CODES } from '../config/error-codes';
import { FormattedDelayData, OutputDTO } from '../types';

/**
 * 성공 응답 생성
 *
 * @param dataArray - 포맷팅된 지연 데이터 배열
 * @param hasPartialFailure - 부분 실패 여부
 * @returns OutputDTO
 */
export function createSuccessResponse(
  dataArray: FormattedDelayData[],
  hasPartialFailure: boolean
): OutputDTO {
  const { code, msg } = determineResponseCode(dataArray.length, hasPartialFailure);
  return buildResponse(code, msg, dataArray);
}

/**
 * 에러 응답 생성
 *
 * @param code - 에러 코드
 * @param msg - 에러 메시지
 * @returns OutputDTO
 */
export function createErrorResponse(code: string, msg: string): OutputDTO {
  return buildResponse(code, msg, []);
}

/**
 * 응답 코드 결정 (우선순위 로직)
 *
 * 우선순위:
 * 1. hasPartialFailure 체크
 * 2. dataArray.length 체크
 *
 * @param dataCount - 데이터 개수
 * @param hasPartialFailure - 부분 실패 여부
 * @returns 응답 코드와 메시지
 */
function determineResponseCode(
  dataCount: number,
  hasPartialFailure: boolean
): { code: string; msg: string } {
  if (hasPartialFailure) {
    if (dataCount > 0) {
      // 부분 실패 + 데이터 있음 → 1000206
      return ERROR_CODES.SUCCESS_PARTIAL;
    } else {
      // 부분 실패 + 데이터 없음 → 1000204 (커스텀 메시지)
      return {
        code: ERROR_CODES.SUCCESS_NO_DATA.code,
        msg: '자동연동 성공(내용 없음) - 일부 사이트 연동 실패'
      };
    }
  }

  // 정상 케이스
  return dataCount > 0
    ? ERROR_CODES.SUCCESS
    : ERROR_CODES.SUCCESS_NO_DATA;
}

/**
 * OutputDTO 구조 생성
 *
 * @param code - 응답 코드
 * @param msg - 응답 메시지
 * @param dataArray - 데이터 배열
 * @returns OutputDTO
 */
function buildResponse(
  code: string,
  msg: string,
  dataArray: FormattedDelayData[]
): OutputDTO {
  return {
    out: {
      code,
      msg,
      data: {
        ch2: {
          code,
          msg,
          data: {
            dataArray
          }
        }
      }
    }
  };
}
