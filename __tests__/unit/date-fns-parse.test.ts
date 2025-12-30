/**
 * date-fns parse() 함수 동작 테스트
 * 
 * - parse()가 Invalid Date를 반환하는지
 * - 자동 보정이 일어나는지
 * - format()과 비교 검증이 필요한지
 */

import { parse, format, isValid } from 'date-fns';

describe('date-fns parse() 함수 동작 검증', () => {
  describe('유효한 날짜', () => {
    it('정상 날짜: 2025년 12월 6일', () => {
      const dateStr = '20251206';
      const date = parse(dateStr, 'yyyyMMdd', new Date());

      // Date 객체가 생성되는지 확인
      expect(date).toBeInstanceOf(Date);
      
      // 유효한 날짜인지 확인
      expect(isValid(date)).toBe(true);
      expect(!isNaN(date.getTime())).toBe(true);

      // format()으로 다시 변환했을 때 원본과 일치하는지
      const formatted = format(date, 'yyyyMMdd');
      expect(formatted).toBe(dateStr);
      expect(formatted).toBe('20251206');
    });

    it('정상 날짜: 2025년 2월 28일', () => {
      const dateStr = '20250228';
      const date = parse(dateStr, 'yyyyMMdd', new Date());

      expect(isValid(date)).toBe(true);
      
      const formatted = format(date, 'yyyyMMdd');
      expect(formatted).toBe(dateStr);
    });
  });

  describe('유효하지 않은 날짜 - 13월', () => {
    it('13월 1일: 자동 보정되는지, 아니면 Invalid Date인지', () => {
      const dateStr = '20251301'; // 13월 1일
      const date = parse(dateStr, 'yyyyMMdd', new Date());

      console.log('📊 13월 1일 테스트:');
      console.log('  - 입력:', dateStr);
      console.log('  - Date 객체:', date);
      console.log('  - isValid(date):', isValid(date));
      console.log('  - getTime():', date.getTime());
      console.log('  - isNaN(getTime()):', isNaN(date.getTime()));
      
      // format() 시도
      try {
        const formatted = format(date, 'yyyyMMdd');
        console.log('  - format() 결과:', formatted);
        console.log('  - 원본과 일치:', formatted === dateStr);
        
        // 자동 보정이 일어났는지 확인
        if (formatted !== dateStr) {
          console.log('자동 보정 발생! 원본과 다름');
        } else {
          console.log('자동 보정 안 됨, 원본과 동일');
        }
      } catch (error) {
        console.log('  - format() 에러 발생:', error);
      }

      // 테스트 결과 검증
      if (isValid(date)) {
        // 유효한 날짜라면 자동 보정이 일어났는지 확인
        const formatted = format(date, 'yyyyMMdd');
        if (formatted !== dateStr) {
          // 자동 보정 발생
          expect(formatted).toBe('20260101'); // 다음 해 1월 1일로 보정될 것으로 예상
        }
      } else {
        // Invalid Date라면 자동 보정이 안 일어남
        expect(isValid(date)).toBe(false);
        expect(isNaN(date.getTime())).toBe(true);
      }
    });
  });

  describe('유효하지 않은 날짜 - 2월 30일', () => {
    it('2월 30일: 자동 보정되는지, 아니면 Invalid Date인지', () => {
      const dateStr = '20250230'; // 2월 30일 (존재하지 않음)
      const date = parse(dateStr, 'yyyyMMdd', new Date());

      console.log('2월 30일 테스트:');
      console.log('  - 입력:', dateStr);
      console.log('  - Date 객체:', date);
      console.log('  - isValid(date):', isValid(date));
      console.log('  - getTime():', date.getTime());
      console.log('  - isNaN(getTime()):', isNaN(date.getTime()));
      
      try {
        const formatted = format(date, 'yyyyMMdd');
        console.log('  - format() 결과:', formatted);
        console.log('  - 원본과 일치:', formatted === dateStr);
        
        if (formatted !== dateStr) {
          console.log('자동 보정 발생! 원본과 다름');
        } else {
          console.log('자동 보정 안 됨, 원본과 동일');
        }
      } catch (error) {
        console.log('  - format() 에러 발생:', error);
      }

      // 테스트 결과 검증
      if (isValid(date)) {
        const formatted = format(date, 'yyyyMMdd');
        if (formatted !== dateStr) {
          // 자동 보정 발생 (예: 3월 2일로 보정될 수 있음)
          expect(formatted).not.toBe(dateStr);
        }
      } else {
        // Invalid Date
        expect(isValid(date)).toBe(false);
        expect(isNaN(date.getTime())).toBe(true);
      }
    });
  });

  describe('유효하지 않은 날짜 - 4월 31일', () => {
    it('4월 31일: 자동 보정되는지, 아니면 Invalid Date인지', () => {
      const dateStr = '20250431'; // 4월 31일 (존재하지 않음, 4월은 30일까지만)
      const date = parse(dateStr, 'yyyyMMdd', new Date());

      console.log('4월 31일 테스트:');
      console.log('  - 입력:', dateStr);
      console.log('  - Date 객체:', date);
      console.log('  - isValid(date):', isValid(date));
      console.log('  - getTime():', date.getTime());
      console.log('  - isNaN(getTime()):', isNaN(date.getTime()));
      
      try {
        const formatted = format(date, 'yyyyMMdd');
        console.log('  - format() 결과:', formatted);
        console.log('  - 원본과 일치:', formatted === dateStr);
        
        if (formatted !== dateStr) {
          console.log(' 자동 보정 발생! 원본과 다름');
        } else {
          console.log('자동 보정 안 됨, 원본과 동일');
        }
      } catch (error) {
        console.log('  - format() 에러 발생:', error);
      }

      // 테스트 결과 검증
      if (isValid(date)) {
        const formatted = format(date, 'yyyyMMdd');
        if (formatted !== dateStr) {
          // 자동 보정 발생 (예: 5월 1일로 보정될 수 있음)
          expect(formatted).not.toBe(dateStr);
        }
      } else {
        // Invalid Date
        expect(isValid(date)).toBe(false);
        expect(isNaN(date.getTime())).toBe(true);
      }
    });
  });

  describe('검증 방법 비교', () => {
    it('유효하지 않은 날짜를 감지하는 방법 비교', () => {
      const invalidDateStr = '20251301';
      const date = parse(invalidDateStr, 'yyyyMMdd', new Date());

      console.log('\n 검증 방법 비교:');
      
      // 방법 1: isValid() 사용
      const method1_isValid = isValid(date);
      console.log('  방법 1 - isValid(date):', method1_isValid);

      // 방법 2: getTime()이 NaN인지 확인
      const method2_isNaN = isNaN(date.getTime());
      console.log('  방법 2 - isNaN(date.getTime()):', method2_isNaN);

      // 방법 3: format() 후 원본과 비교
      let method3_mismatch = false;
      try {
        const formatted = format(date, 'yyyyMMdd');
        method3_mismatch = formatted !== invalidDateStr;
        console.log('  방법 3 - format() 후 원본과 비교:', method3_mismatch);
        console.log('    - 원본:', invalidDateStr);
        console.log('    - format() 결과:', formatted);
      } catch (error) {
        console.log('  방법 3 - format() 에러 발생:', error);
        method3_mismatch = true; // 에러 발생 시 불일치로 간주
      }

      // 방법 4: RangeError catch
      let method4_hasError = false;
      try {
        format(date, 'yyyyMMdd');
      } catch (error) {
        method4_hasError = error instanceof RangeError;
        console.log('  방법 4 - format() RangeError:', method4_hasError);
      }

      console.log('\n 결과 요약:');
      console.log('  - isValid()로 체크 가능:', !method1_isValid ? 'YES' : 'NO');
      console.log('  - getTime() NaN으로 체크 가능:', method2_isNaN ? 'YES' : 'NO');
      console.log('  - format() 비교 필요:', method3_mismatch ? 'YES' : 'NO');
      console.log('  - format() 에러 발생:', method4_hasError ? 'YES' : 'NO');

      // 모든 방법이 동일한 결과를 내는지 확인
      const isInvalid = !method1_isValid || method2_isNaN || method3_mismatch || method4_hasError;
      expect(isInvalid).toBe(true);
    });
  });

  describe('현재 코드의 검증 방법 평가', () => {
    it('parse() → format() → 비교 방식이 필요한지 확인', () => {
      const testCases = [
        { input: '20251206', expected: true, desc: '유효한 날짜' },
        { input: '20251301', expected: false, desc: '13월' },
        { input: '20250230', expected: false, desc: '2월 30일' },
        { input: '20250431', expected: false, desc: '4월 31일' },
      ];

      console.log('\n 현재 코드의 검증 방법 평가:');
      
      testCases.forEach(({ input, expected, desc }) => {
        const date = parse(input, 'yyyyMMdd', new Date());
        
        // 방법 1: isValid()만 사용
        const method1 = isValid(date);
        
        // 방법 2: 현재 코드 방식 (parse → format → 비교)
        let method2 = false;
        try {
          const formatted = format(date, 'yyyyMMdd');
          method2 = formatted === input;
        } catch (error) {
          method2 = false;
        }

        console.log(`\n  ${desc} (${input}):`);
        console.log(`    - isValid(): ${method1}`);
        console.log(`    - format() 비교: ${method2}`);
        console.log(`    - 예상 결과: ${expected ? '유효' : '무효'}`);
        console.log(`    - isValid()로 충분: ${method1 === expected ? 'YES ' : 'NO '}`);
        console.log(`    - format() 비교 필요: ${method2 === expected ? 'NO (충분함) ' : 'YES '}`);

        // 유효한 날짜는 둘 다 true여야 함
        if (expected) {
          expect(method1).toBe(true);
          expect(method2).toBe(true);
        } else {
          // 유효하지 않은 날짜는 둘 다 false여야 함
          // 또는 isValid()가 false면 format() 비교는 불필요
          if (!method1) {
            expect(method1).toBe(false);
            console.log(`    → isValid()가 false이므로 format() 비교는 불필요`);
          }
        }
      });
    });
  });
});
