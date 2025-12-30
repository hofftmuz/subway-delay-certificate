/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 로직을 제공하는 추상 클래스
 * 모든 스크래퍼가 상속받아 사용
 */

import axios, { AxiosInstance } from 'axios';
import { ScrapedDelayInfo } from '../types';
import { USER_AGENT, HTTP_TIMEOUT } from '../config/http-config';
import { ERROR_TYPES } from '../config/error-types';
import { isAxiosError, handleAxiosError } from '../utils/axios-error-handler';

/**
 * 스크래퍼 베이스 클래스
 *
 * 공통 에러 처리 및 HTTP 요청 로직을 제공
 */
export abstract class BaseScraper {
  protected abstract readonly url: string;
  protected abstract readonly siteName: string;
  protected readonly timeout = HTTP_TIMEOUT;

  /**
   * HTTP 클라이언트 인스턴스
   * 공통 헤더와 타임아웃 설정을 포함
   */
  protected readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      timeout: HTTP_TIMEOUT,
    });
  }

  /**
   * 지연 정보 스크래핑 (추상 메서드)
   *
   * 각 스크래퍼는 이 메서드를 구현
   */
  abstract scrape(date: string): Promise<ScrapedDelayInfo[]>;

  /**
   * HTTP POST 요청 실행
   *
   * @param body - POST 요청 body (URL encoded 형식)
   * @returns 응답 데이터 (HTML 문자열)
   * @throws Error - 타임아웃, 네트워크 에러 시 예외 발생
   */
  protected async executePostRequest(body: string): Promise<string> {
    try {
      const response = await this.httpClient.post(this.url, body);

      return response.data;
    } catch (error: unknown) {
      // AxiosError 처리 (타임아웃, 연결 거부, 서버 에러 등)
      if (isAxiosError(error)) {
        handleAxiosError(error, this.siteName);
      }

      // AxiosError가 아닌 기타 에러는 네트워크 에러로 처리
      console.error(`[${this.siteName}] 예상치 못한 에러 발생:`, error);
      throw new Error(ERROR_TYPES.NETWORK_ERROR);
    }
  }

}
