/**
 * 메인 진입점
 *
 * API 요청을 처리하는 핸들러 함수
 * - 입력 검증
 * - 서비스 호출
 * - 에러 처리 및 응답 생성
 */

import { InputDTO, OutputDTO, ValidationError } from './types';
import { DelayScraperService } from './services/delay-scraper-service';
import { createErrorResponse } from './utils/response-formatters';
import { ERROR_CODES } from './config/error-codes';
import { ERROR_TYPES } from './config/error-types';

/**
 * 메인 핸들러 함수
 *
 * Node.js 서버 함수 형식으로 작성
 *
 * @param input - API 입력 데이터
 * @returns API 출력 데이터
 */
export async function handler(input: InputDTO): Promise<OutputDTO> {
  try {
    console.log('[Handler] 요청 시작:', JSON.stringify(input));

    const service = new DelayScraperService();
    const result = await service.processRequest(input);

    console.log('[Handler] 요청 완료:', result.out.code);
    return result;
  } catch (error) {
    console.error('[Handler] 에러 발생:', error);
    return handleError(error);
  }
}

/**
 * 에러 처리
 *
 * 에러 타입에 따라 적절한 응답 코드 반환
 *
 * @param error - 발생한 에러
 * @returns 에러 응답
 */
function handleError(error: unknown): OutputDTO {
  // 입력 검증 에러
  if (error instanceof ValidationError) {
    return createErrorResponse(error.code, error.message);
  }

  // Error 인스턴스인 경우
  if (error instanceof Error) {
    // 타임아웃 에러
    if (error.message === ERROR_TYPES.TIMEOUT_ERROR) {
      return createErrorResponse(
        ERROR_CODES.TIMEOUT.code,
        ERROR_CODES.TIMEOUT.msg
      );
    }

    // 파싱 에러
    if (error.message === ERROR_TYPES.PARSING_ERROR) {
      return createErrorResponse(
        ERROR_CODES.PARSING_ERROR.code,
        ERROR_CODES.PARSING_ERROR.msg
      );
    }

    // 네트워크 에러
    if (error.message === ERROR_TYPES.NETWORK_ERROR) {
      return createErrorResponse(
        ERROR_CODES.NETWORK_ERROR.code,
        ERROR_CODES.NETWORK_ERROR.msg
      );
    }
  }

  // 알 수 없는 에러 (기본값: 네트워크 에러)
  console.error('[Handler] 알 수 없는 에러:', error);
  return createErrorResponse(
    ERROR_CODES.NETWORK_ERROR.code,
    ERROR_CODES.NETWORK_ERROR.msg
  );
}

// 터미널에서 직접 실행할 때 사용
if (require.main === module) {
  (async () => {
    try {
      const fs = require('fs');

      // 파일 경로를 인자로 받거나, stdin에서 읽기
      let inputData: InputDTO;

      if (process.argv[2]) {
        // 파일 경로가 제공된 경우
        const filePath = process.argv[2];
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        inputData = JSON.parse(fileContent);
      } else {
        // stdin에서 읽기 (방식 2: process.stdin 직접 읽기)
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        const input = Buffer.concat(chunks).toString('utf-8');

        if (!input.trim()) {
          console.error('에러: 입력 데이터가 없습니다.');
          console.log('사용법: node dist/index.js input.json');
          console.log('   또는: cat input.json | node dist/index.js');
          process.exit(1);
        }

        inputData = JSON.parse(input);
      }

      const result = await handler(inputData);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('에러 발생:', error);
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        if (error.stack) {
          console.error('스택 트레이스:', error.stack);
        }
      }
      process.exit(1);
    }
  })();
}
