/**
 * ResponseFormatter 단위 테스트
 *
 * 응답 포맷팅 로직의 모든 케이스 테스트
 */

import { createSuccessResponse, createErrorResponse } from '../../src/utils/response-formatters';
import { FormattedDelayData, OutputDTO } from '../../src/types';
import { ERROR_CODES } from '../../src/config/error-codes';

describe('ResponseFormatter', () => {
  describe('createSuccessResponse', () => {
    const mockData: FormattedDelayData = {
      line: '1호선',
      direction: '상행선',
      timeRange: '첫차~09시',
      delayDate: '251206',
      delayStart: '202512060400',
      delayEnd: '202512060900',
      delayTime: '5',
      pdfBase64: ''
    };

    it('정상 성공: 데이터 있음, 부분 실패 없음 → 1000200', () => {
      const dataArray: FormattedDelayData[] = [mockData];
      const result = createSuccessResponse(dataArray, false);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS.code);
      expect(result.out.msg).toBe(ERROR_CODES.SUCCESS.msg);
      expect(result.out.data.ch2.code).toBe(ERROR_CODES.SUCCESS.code);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(1);
    });

    it('정상 성공: 데이터 없음, 부분 실패 없음 → 1000204', () => {
      const dataArray: FormattedDelayData[] = [];
      const result = createSuccessResponse(dataArray, false);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS_NO_DATA.code);
      expect(result.out.msg).toBe(ERROR_CODES.SUCCESS_NO_DATA.msg);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(0);
    });

    it('부분 성공: 데이터 있음, 부분 실패 있음 → 1000206', () => {
      const dataArray: FormattedDelayData[] = [mockData];
      const result = createSuccessResponse(dataArray, true);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS_PARTIAL.code);
      expect(result.out.msg).toBe(ERROR_CODES.SUCCESS_PARTIAL.msg);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(1);
    });

    it('부분 성공: 데이터 없음, 부분 실패 있음 → 1000204 (커스텀 메시지)', () => {
      const dataArray: FormattedDelayData[] = [];
      const result = createSuccessResponse(dataArray, true);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS_NO_DATA.code);
      expect(result.out.msg).toBe('자동연동 성공(내용 없음) - 일부 사이트 연동 실패');
      expect(result.out.data.ch2.data.dataArray).toHaveLength(0);
    });

    it('여러 데이터: 정상 성공', () => {
      const dataArray: FormattedDelayData[] = [
        mockData,
        { ...mockData, line: '2호선' },
        { ...mockData, line: '3호선' }
      ];
      const result = createSuccessResponse(dataArray, false);

      expect(result.out.code).toBe(ERROR_CODES.SUCCESS.code);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(3);
    });

    it('응답 구조 검증: 모든 필수 필드 존재', () => {
      const dataArray: FormattedDelayData[] = [mockData];
      const result = createSuccessResponse(dataArray, false);

      // 최상위 레벨
      expect(result.out).toBeDefined();
      expect(result.out.code).toBeDefined();
      expect(result.out.msg).toBeDefined();
      expect(result.out.data).toBeDefined();

      // ch2 레벨
      expect(result.out.data.ch2).toBeDefined();
      expect(result.out.data.ch2.code).toBeDefined();
      expect(result.out.data.ch2.msg).toBeDefined();
      expect(result.out.data.ch2.data).toBeDefined();

      // dataArray 레벨
      expect(result.out.data.ch2.data.dataArray).toBeDefined();
      expect(Array.isArray(result.out.data.ch2.data.dataArray)).toBe(true);
    });
  });

  describe('createErrorResponse', () => {
    it('에러 응답 생성: 기본 구조', () => {
      const code = '1000016';
      const msg = '에러 메시지';
      const result = createErrorResponse(code, msg);

      expect(result.out.code).toBe(code);
      expect(result.out.msg).toBe(msg);
      expect(result.out.data.ch2.code).toBe(code);
      expect(result.out.data.ch2.msg).toBe(msg);
      expect(result.out.data.ch2.data.dataArray).toHaveLength(0);
    });

    it('에러 응답 생성: ValidationError 코드', () => {
      const result = createErrorResponse(
        ERROR_CODES.FUTURE_DATE.code,
        ERROR_CODES.FUTURE_DATE.msg
      );

      expect(result.out.code).toBe(ERROR_CODES.FUTURE_DATE.code);
      expect(result.out.msg).toBe(ERROR_CODES.FUTURE_DATE.msg);
    });

    it('에러 응답 생성: NetworkError 코드', () => {
      const result = createErrorResponse(
        ERROR_CODES.NETWORK_ERROR.code,
        ERROR_CODES.NETWORK_ERROR.msg
      );

      expect(result.out.code).toBe(ERROR_CODES.NETWORK_ERROR.code);
      expect(result.out.msg).toBe(ERROR_CODES.NETWORK_ERROR.msg);
    });

    it('에러 응답 생성: TimeoutError 코드', () => {
      const result = createErrorResponse(
        ERROR_CODES.TIMEOUT.code,
        ERROR_CODES.TIMEOUT.msg
      );

      expect(result.out.code).toBe(ERROR_CODES.TIMEOUT.code);
      expect(result.out.msg).toBe(ERROR_CODES.TIMEOUT.msg);
    });

    it('에러 응답 생성: ParsingError 코드', () => {
      const result = createErrorResponse(
        ERROR_CODES.PARSING_ERROR.code,
        ERROR_CODES.PARSING_ERROR.msg
      );

      expect(result.out.code).toBe(ERROR_CODES.PARSING_ERROR.code);
      expect(result.out.msg).toBe(ERROR_CODES.PARSING_ERROR.msg);
    });

    it('응답 구조 검증: 모든 필수 필드 존재', () => {
      const result = createErrorResponse('1000016', '에러 메시지');

      // 최상위 레벨
      expect(result.out).toBeDefined();
      expect(result.out.code).toBeDefined();
      expect(result.out.msg).toBeDefined();
      expect(result.out.data).toBeDefined();

      // ch2 레벨
      expect(result.out.data.ch2).toBeDefined();
      expect(result.out.data.ch2.code).toBeDefined();
      expect(result.out.data.ch2.msg).toBeDefined();
      expect(result.out.data.ch2.data).toBeDefined();

      // dataArray 레벨 (빈 배열)
      expect(result.out.data.ch2.data.dataArray).toBeDefined();
      expect(Array.isArray(result.out.data.ch2.data.dataArray)).toBe(true);
      expect(result.out.data.ch2.data.dataArray.length).toBe(0);
    });
  });
});
