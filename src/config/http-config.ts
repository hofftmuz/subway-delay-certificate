/**
 * HTTP 설정
 *
 * HTTP 요청에 사용되는 공통 설정값
 */

import os from 'os';

/**
 * OS 따른 User-Agent 생성
 *
 * @returns OS에 맞는 User-Agent 문자열
 */
function generateUserAgent(): string {
  const platform = os.platform();

  // OS별 User-Agent 매핑
  const osUserAgents: Record<string, string> = {
    // Windows
    win32: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,

    // macOS
    darwin: `Mozilla/5.0 (Macintosh; Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,

    // Linux
    linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
  };

  // 플랫폼에 맞는 User-Agent 반환, 없으면 macOS 기본값 사용
  return osUserAgents[platform] || osUserAgents.darwin;
}

/**
 * User-Agent 문자열
 *
 * 실행 환경의 OS에 따라 동적으로 생성
 * - Windows: Windows NT 10.0
 * - macOS: Mac OS X 10_15_7
 * - Linux: Linux x86_64
 * - 기타: macOS 기본값
 */
export const USER_AGENT = generateUserAgent();

/**
 * HTTP 요청 타임아웃 (밀리초)
 */
export const HTTP_TIMEOUT = 10000; // 10초
