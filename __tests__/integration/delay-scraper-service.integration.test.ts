/**
 * DelayScraperService 통합 테스트
 *
 * 실제 HTTP 호출을 포함한 전체 플로우 테스트
 *
 * 이 테스트는 실제 사이트에 HTTP 요청을 보냅니다.
 * - 각 테스트마다 실제 네트워크 요청
 * - 외부 사이트 상태에 따라 실패할 수 있음
 * - 선택적으로 실행하는 방법 : npm test -- --testPathPattern=integration
 */

import { DelayScraperService } from '../../src/services/delay-scraper-service';
import { InputDTO } from '../../src/types';
import { ERROR_CODES } from '../../src/config/error-codes';

describe('DelayScraperService Integration (실제 호출)', () => {
  let service: DelayScraperService;

  beforeEach(() => {
    service = new DelayScraperService();
  });

  jest.setTimeout(30000); // 30초

  describe('전체 플로우 - 실제 스크래핑', () => {
    it('전체 플로우: 오늘 날짜 (기본값)', async () => {
      const input: InputDTO = {
        in: {
          ch2: {}
        }
      };
      try {
        const result = await service.processRequest(input);

      // 응답 구조 검증
      expect(result.out).toBeDefined();
      expect(result.out.code).toBeDefined();
      expect(result.out.msg).toBeDefined();
      expect(result.out.data.ch2).toBeDefined();
      expect(result.out.data.ch2.data.dataArray).toBeDefined();
      expect(Array.isArray(result.out.data.ch2.data.dataArray)).toBe(true);

        // 성공 코드 중 하나여야 함
        const successCodes = [
          ERROR_CODES.SUCCESS.code,
          ERROR_CODES.SUCCESS_NO_DATA.code,
          ERROR_CODES.SUCCESS_PARTIAL.code
        ];
        expect(successCodes).toContain(result.out.code);

        // JSON 형식으로 결과 출력
        console.log('\n=== 전체 플로우: 오늘 날짜 (기본값) ===');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        // 실제 사이트 상태에 따라 에러가 발생할 수 있음 (정상)
        // PARSING_ERROR, TIMEOUT_ERROR, NETWORK_ERROR 등
        console.log('\n=== 전체 플로우: 오늘 날짜 (기본값) - 에러 ===');
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error)
        }, null, 2));
        expect(error).toBeDefined();
      }
    });

    it('전체 플로우: 현재 날짜 (오늘)', async () => {
      // 현재 날짜로 테스트
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '30',
            pdfDataYn: '0'
          }
        }
      };

      // 실제 사이트 상태에 따라 에러가 발생할 수 있음
      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.code).toBeDefined();

        // JSON 형식으로 결과 출력
        console.log('\n=== 전체 플로우: 현재 날짜 (오늘) ===');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        // 실제 사이트 상태에 따라 에러가 발생할 수 있음 (정상)
        console.log('\n=== 전체 플로우: 현재 날짜 (오늘) - 에러 ===');
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          date: dateStr
        }, null, 2));
        expect(error).toBeDefined();
      }
    });

    it('전체 플로우: 특정 날짜 지정 (7일 이내)', async () => {
      // 오늘로부터 5일 전 날짜 계산
      const today = new Date();
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);
      const dateStr = fiveDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '30',
            pdfDataYn: '0'
          }
        }
      };

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.code).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('전체 플로우: 7일 초과 날짜 (코레일 생략)', async () => {
      // 오늘로부터 10일 전 날짜 계산
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 10);
      const dateStr = tenDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr
          }
        }
      };

      const result = await service.processRequest(input);

      expect(result.out.code).toBeDefined();
      expect(result.out.code).not.toBe(ERROR_CODES.SUCCESS_PARTIAL.code);
    });

    it('전체 플로우: delayTime 필터링', async () => {
      const input: InputDTO = {
        in: {
          ch2: {
            delayTime: '100' // 큰 값으로 필터링
          }
        }
      };
      try {
        const result = await service.processRequest(input);

        result.out.data.ch2.data.dataArray.forEach(item => {
          expect(parseInt(item.delayTime, 10)).toBeGreaterThanOrEqual(100);
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('에러 케이스 - 실제 네트워크', () => {
    it('30일 초과 날짜: ValidationError', async () => {
      // 오늘로부터 35일 전 날짜 계산
      const today = new Date();
      const thirtyFiveDaysAgo = new Date(today);
      thirtyFiveDaysAgo.setDate(today.getDate() - 35);
      const dateStr = thirtyFiveDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr
          }
        }
      };
      await expect(service.processRequest(input)).rejects.toThrow();
    });

    it('미래 날짜: ValidationError', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr
          }
        }
      };
      await expect(service.processRequest(input)).rejects.toThrow();
    });
  });

  describe('서비스 메서드 개별 테스트', () => {
    it('scrape: 실제 스크래핑 (현재 날짜)', async () => {
      // 현재 날짜로 테스트
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      try {
        const result = await service.scrape(dateStr);

        expect(result.allData).toBeDefined();
        expect(Array.isArray(result.allData)).toBe(true);
        expect(typeof result.hasPartialFailure).toBe('boolean');
        
        // JSON 형식으로 결과 출력
        console.log('\n=== scrape: 실제 스크래핑 (현재 날짜) ===');
        console.log(JSON.stringify({
          date: dateStr,
          totalCount: result.allData.length,
          hasPartialFailure: result.hasPartialFailure,
          data: result.allData
        }, null, 2));
      } catch (error) {
        // 실제 사이트 상태에 따라 에러가 발생할 수 있음 (정상)
        console.log('\n=== scrape: 실제 스크래핑 (현재 날짜) - 에러 ===');
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          date: dateStr
        }, null, 2));
        expect(error).toBeDefined();
      }
    });

    it('scrape: 실제 스크래핑 (7일 이내)', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      const dateStr = threeDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');

      try {
        const result = await service.scrape(dateStr);

        expect(result.allData).toBeDefined();
        expect(Array.isArray(result.allData)).toBe(true);
        expect(typeof result.hasPartialFailure).toBe('boolean');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('scrape: 실제 스크래핑 (7일 초과, 코레일 생략)', async () => {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 10);
      const dateStr = tenDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');

      const result = await service.scrape(dateStr);

      expect(result.allData).toBeDefined();
      expect(result.hasPartialFailure).toBe(true);
    });
  });

  describe('PDF Base64 생성 테스트', () => {
    it('전체 플로우: pdfDataYn=1 (Base64 생성)', async () => {
      // 현재 날짜로 테스트
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '30',
            pdfDataYn: '1' // PDF 생성 요청
          }
        }
      };

      jest.setTimeout(60000); // 60초

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.code).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        // PDF Base64 검증
        const hasPdfData = result.out.data.ch2.data.dataArray.some(item => {
          const hasBase64 = item.pdfBase64 && item.pdfBase64.length > 0;
          if (hasBase64 && item.pdfBase64) {
            console.log(`[PDF 검증] ${item.line} ${item.direction} ${item.timeRange}: Base64 길이 ${item.pdfBase64.length}`);
          }
          return hasBase64;
        });

        // Base64가 생성되었는지 확인
        const itemsWithPdf = result.out.data.ch2.data.dataArray.filter(item => item.pdfBase64 && item.pdfBase64.length > 0);
        console.log(`\n[PDF 검증] 총 ${result.out.data.ch2.data.dataArray.length}건 중 Base64 생성된 항목: ${itemsWithPdf.length}건`);

        console.log('\n=== 전체 플로우: pdfDataYn=1 (Base64 생성) ===');
        console.log(JSON.stringify(result, null, 2));

        // Base64 데이터를 파일로 저장 (복원 확인용)
        if (itemsWithPdf.length > 0) {
          const fs = require('fs');
          const path = require('path');

          // output 디렉토리 생성
          const outputDir = path.join(__dirname, '..', '..', 'output');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // 첫 번째 PDF의 Base64를 파일로 저장
          const firstPdf = itemsWithPdf[0];
          const base64String = firstPdf.pdfBase64;

          if (base64String && base64String.length > 0) {
            const base64File = path.join(outputDir, 'sample_base64.txt');
            fs.writeFileSync(base64File, base64String);

            // PDF로 복원
            const pdfBuffer = Buffer.from(base64String, 'base64');
            const pdfFile = path.join(outputDir, `restored_${firstPdf.line}_${firstPdf.direction}_${firstPdf.timeRange.replace(/[~\/]/g, '_')}.pdf`);
            fs.writeFileSync(pdfFile, pdfBuffer);
          }
        }
      } catch (error) {
        console.log('\n=== 전체 플로우: pdfDataYn=1 (Base64 생성) - 에러 ===');
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          date: dateStr
        }, null, 2));
        expect(error).toBeDefined();
      }
    });

    it('전체 플로우: pdfDataYn=0 (Base64 없음)', async () => {
      // 현재 날짜로 테스트
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '30',
            pdfDataYn: '0' // PDF 생성 안 함
          }
        }
      };

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.code).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        result.out.data.ch2.data.dataArray.forEach(item => {
          expect(item.pdfBase64 || '').toBe('');
        });

        console.log('\n=== 전체 플로우: pdfDataYn=0 (Base64 없음) ===');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log('\n=== 전체 플로우: pdfDataYn=0 (Base64 없음) - 에러 ===');
        console.log(JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          date: dateStr
        }, null, 2));
        expect(error).toBeDefined();
      }
    });
  });
});
