/**
 * InputValidator 단위 테스트
 *
 * 입력 검증 로직의 모든 케이스 테스트
 */

import { validateInput } from '../../src/utils/input-validator';
import { InputDTO, ValidationError } from '../../src/types';
import { ERROR_CODES } from '../../src/config/error-codes';

describe('InputValidator', () => {
  describe('validateInput - 전체 검증', () => {
    it('모든 필드 기본값 적용: 빈 입력', () => {
      const input: InputDTO = { in: { ch2: {} } };
      const result = validateInput(input);

      expect(result.inqrDate).toMatch(/^\d{8}$/);
      expect(result.delayTime).toBe('30');
      expect(result.pdfDataYn).toBe('0');
    });

    it('모든 필드 제공: 정상 케이스', () => {
      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: '20251206',
            delayTime: '5',
            pdfDataYn: '1'
          }
        }
      };
      const result = validateInput(input);

      expect(result.inqrDate).toBe('20251206');
      expect(result.delayTime).toBe('5');
      expect(result.pdfDataYn).toBe('1');
    });
  });

  describe('inqrDate 검증', () => {
    it('기본값 적용: inqrDate 없음 → 오늘 날짜', () => {
      const input: InputDTO = { in: { ch2: {} } };
      const result = validateInput(input);

      expect(result.inqrDate).toMatch(/^\d{8}$/);
      expect(result.inqrDate.length).toBe(8);
    });

    it('정상 날짜: YYYYMMDD 형식', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '20251206' } }
      };
      const result = validateInput(input);

      expect(result.inqrDate).toBe('20251206');
    });

    it('날짜 형식 오류: 8자리 숫자 아님', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '2025-12-06' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow(ERROR_CODES.INVALID_DATE_FORMAT.msg);
    });

    it('날짜 형식 오류: 7자리', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '2025126' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('날짜 형식 오류: 9자리', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '202512061' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('유효하지 않은 날짜: 20251301 (13월)', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '20251301' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('유효하지 않은 날짜: 20250230 (2월 30일)', () => {
      const input: InputDTO = {
        in: { ch2: { inqrDate: '20250230' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('미래 날짜: 오늘보다 미래', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: { ch2: { inqrDate: tomorrowStr } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow(ERROR_CODES.FUTURE_DATE.msg);
    });

    it('과거 날짜: 정상 처리', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: { ch2: { inqrDate: yesterdayStr } }
      };
      const result = validateInput(input);

      expect(result.inqrDate).toBe(yesterdayStr);
    });

    it('오늘 날짜: 정상 처리', () => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: { ch2: { inqrDate: todayStr } }
      };
      const result = validateInput(input);

      expect(result.inqrDate).toBe(todayStr);
    });
  });

  describe('delayTime 검증', () => {
    it('기본값 적용: delayTime 없음 → "30"', () => {
      const input: InputDTO = { in: { ch2: {} } };
      const result = validateInput(input);

      expect(result.delayTime).toBe('30');
    });

    it('정상 값: 숫자 문자열', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '5' } }
      };
      const result = validateInput(input);

      expect(result.delayTime).toBe('5');
    });

    it('정상 값: 큰 숫자', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '100' } }
      };
      const result = validateInput(input);

      expect(result.delayTime).toBe('100');
    });

    it('정상 값: 0', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '0' } }
      };
      const result = validateInput(input);

      expect(result.delayTime).toBe('0');
    });

    it('형식 오류: 음수', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '-5' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow(ERROR_CODES.INVALID_INPUT.msg);
    });

    it('형식 오류: 숫자가 아님', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: 'abc' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('형식 오류: 소수점', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '5.5' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('형식 오류: 공백 포함', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: ' 5 ' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('형식 오류: 빈 문자열', () => {
      const input: InputDTO = {
        in: { ch2: { delayTime: '' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow(ERROR_CODES.INVALID_INPUT.msg);
    });
  });

  describe('pdfDataYn 검증', () => {
    it('기본값 적용: pdfDataYn 없음 → "0"', () => {
      const input: InputDTO = { in: { ch2: {} } };
      const result = validateInput(input);

      expect(result.pdfDataYn).toBe('0');
    });

    it('정상 값: "0"', () => {
      const input: InputDTO = {
        in: { ch2: { pdfDataYn: '0' } }
      };
      const result = validateInput(input);

      expect(result.pdfDataYn).toBe('0');
    });

    it('정상 값: "1"', () => {
      const input: InputDTO = {
        in: { ch2: { pdfDataYn: '1' } }
      };
      const result = validateInput(input);

      expect(result.pdfDataYn).toBe('1');
    });

    it('형식 오류: "2"', () => {
      const input: InputDTO = {
        in: { ch2: { pdfDataYn: '2' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
      expect(() => validateInput(input)).toThrow(ERROR_CODES.INVALID_INPUT.msg);
    });

    it('형식 오류: "true"', () => {
      const input: InputDTO = {
        in: { ch2: { pdfDataYn: 'true' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });

    it('형식 오류: 빈 문자열', () => {
      const input: InputDTO = {
        in: { ch2: { pdfDataYn: '' } }
      };

      expect(() => validateInput(input)).toThrow(ValidationError);
    });
  });
});
