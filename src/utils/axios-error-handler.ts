/**
 * Axios 에러 처리 유틸리티
 *
 * AxiosError를 스크래퍼 내부 표준 에러 타입으로 변환
 * BaseScraper와 PdfDownloader 등에서 공통으로 사용
 */

import { AxiosError } from 'axios';
import { ERROR_TYPES } from '../config/error-types';

/**
 * AxiosError 타입 가드
 *
 * @param error - 에러 객체
 * @returns AxiosError 여부
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * AxiosError 처리
 *
 * HTTP 라이브러리 레벨의 에러(AxiosError)를
 * 스크래퍼 내부 표준 에러 타입(ERROR_TYPES)으로 변환
 *
 * @param error - AxiosError 객체
 * @param context - 에러 발생 컨텍스트 (로깅용, 예: 'BaseScraper', 'PdfDownloader')
 * @throws Error - 변환된 에러 메시지
 * @returns never - 이 함수는 항상 예외를 발생시키므로 반환하지 않음
 */
export function handleAxiosError(error: AxiosError, context?: string): never {
  const contextPrefix = context ? `[${context}]` : '';

  // 타임아웃 에러 처리
  if (error.code === 'ECONNABORTED') {
    console.error(`${contextPrefix} 타임아웃 에러 발생:`, error.message);
    throw new Error(ERROR_TYPES.TIMEOUT_ERROR);
  }

  // 연결 거부 에러 처리
  if (error.code === 'ECONNREFUSED') {
    console.error(`${contextPrefix} 연결 거부 에러 발생:`, error.message);
    throw new Error(ERROR_TYPES.CONNECTION_REFUSED);
  }

  // 서버 에러 처리 (5xx)
  if (error.response?.status && error.response.status >= 500) {
    console.error(
      `${contextPrefix} 서버 에러 발생:`,
      error.response.status,
      error.response.statusText
    );
    throw new Error(ERROR_TYPES.SERVER_ERROR);
  }

  // 기타 Axios 네트워크 에러
  console.error(`${contextPrefix} 네트워크 에러 발생:`, {
    code: error.code,
    message: error.message,
    url: error.config?.url,
  });
  throw new Error(ERROR_TYPES.NETWORK_ERROR);
}
