/**
 * Axios 에러 처리 유틸리티
 *
 * AxiosError를 스크래퍼 내부 표준 에러 타입으로 변환
 * BaseScraper와 PdfDownloader 등에서 공통으로 사용
 */
import { AxiosError } from 'axios';
/**
 * AxiosError 타입 가드
 *
 * @param error - 에러 객체
 * @returns AxiosError 여부
 */
export declare function isAxiosError(error: unknown): error is AxiosError;
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
export declare function handleAxiosError(error: AxiosError, context?: string): never;
//# sourceMappingURL=axios-error-handler.d.ts.map