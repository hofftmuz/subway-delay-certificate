/**
 * PDF 필드 처리 테스트
 *
 * pdfDataYn에 따른 pdfBase64 필드 처리 검증
 * - pdfDataYn="0": pdfBase64 필드 없음
 * - pdfDataYn="1": pdfBase64 필드 있음 (성공: Base64 문자열, 실패: 빈 문자열)
 */

import { DelayScraperService } from '../../src/services/delay-scraper-service';
import { InputDTO } from '../../src/types';

describe('PDF 필드 처리 테스트', () => {
  let service: DelayScraperService;

  beforeEach(() => {
    service = new DelayScraperService();
  });

  jest.setTimeout(60000); // 60초

  describe('pdfDataYn="0" 케이스', () => {
    it('pdfDataYn="0"일 때 pdfBase64 필드가 없어야 함', async () => {
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

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        // pdfDataYn="0"일 때 모든 항목에서 pdfBase64 필드가 없어야 함
        result.out.data.ch2.data.dataArray.forEach((item, index) => {
          expect(item.pdfBase64).toBeUndefined();
        });

        console.log(`\n[테스트 통과] pdfDataYn="0": ${result.out.data.ch2.data.dataArray.length}건 모두 pdfBase64 필드 없음`);
      } catch (error) {
        console.log('\n[테스트 에러] pdfDataYn="0" 테스트 실패:', error);
        throw error;
      }
    });
  });

  describe('pdfDataYn="1" 케이스', () => {
    it('pdfDataYn="1"일 때 pdfBase64 필드가 있어야 함 (성공/실패 모두)', async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '5', 
            pdfDataYn: '1'
          }
        }
      };

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        // pdfDataYn="1"일 때 모든 항목에 pdfBase64 필드가 있어야 함
        result.out.data.ch2.data.dataArray.forEach((item) => {
          expect(item.pdfBase64).toBeDefined();
          expect(typeof item.pdfBase64).toBe('string');
        });

        // 성공/실패 케이스 분류
        const successItems = result.out.data.ch2.data.dataArray.filter(
          item => item.pdfBase64 && item.pdfBase64.trim() !== ''
        );
        const failureItems = result.out.data.ch2.data.dataArray.filter(
          item => !item.pdfBase64 || item.pdfBase64.trim() === ''
        );

        console.log(`\n[테스트 통과] pdfDataYn="1": 총 ${result.out.data.ch2.data.dataArray.length}건`);
        console.log(`[테스트 통과] 성공: ${successItems.length}건 (Base64 문자열)`);
        console.log(`[테스트 통과] 실패: ${failureItems.length}건 (빈 문자열)`);

        // 실패한 항목이 있으면 로그 출력
        if (failureItems.length > 0) {
          console.log('\n[PDF 다운로드 실패 항목]:');
          failureItems.forEach(item => {
            console.log(`  - ${item.line} ${item.direction} ${item.timeRange}: 빈 문자열`);
          });
        }

        // 최소한 하나의 항목은 있어야 함
        expect(result.out.data.ch2.data.dataArray.length).toBeGreaterThan(0);
      } catch (error) {
        console.log('\n[테스트 에러] pdfDataYn="1" 테스트 실패:', error);
        throw error;
      }
    });

    it('pdfDataYn="1"일 때 성공 케이스는 Base64 문자열이어야 함', async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '30',
            pdfDataYn: '1'
          }
        }
      };

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        // 성공한 항목 검증
        const successItems = result.out.data.ch2.data.dataArray.filter(
          (item): item is typeof item & { pdfBase64: string } => 
            item.pdfBase64 !== undefined && item.pdfBase64.trim() !== ''
        );

        successItems.forEach((item) => {
          expect(item.pdfBase64).toBeDefined();
          expect(typeof item.pdfBase64).toBe('string');
          expect(item.pdfBase64.length).toBeGreaterThan(0);
          // Base64 문자열은 최소 100자 이상이어야 함 (PDF는 보통 크기가 큼)
          expect(item.pdfBase64.length).toBeGreaterThan(100);
        });

        if (successItems.length > 0) {
          console.log(`\n[테스트 통과] 성공한 PDF: ${successItems.length}건`);
          console.log(`[테스트 통과] 첫 번째 PDF Base64 길이: ${successItems[0].pdfBase64.length}자`);
        } else {
          console.log('\n[테스트 경고] 성공한 PDF가 없음 (모든 PDF 다운로드 실패 가능)');
        }
      } catch (error) {
        console.log('\n[테스트 에러] PDF 성공 케이스 테스트 실패:', error);
        throw error;
      }
    });

    it('pdfDataYn="1"일 때 실패 케이스는 빈 문자열이어야 함', async () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

      const input: InputDTO = {
        in: {
          ch2: {
            inqrDate: dateStr,
            delayTime: '5',
            pdfDataYn: '1'
          }
        }
      };

      try {
        const result = await service.processRequest(input);

        expect(result.out).toBeDefined();
        expect(result.out.data.ch2.data.dataArray).toBeDefined();

        // 실패한 항목 검증
        const failureItems = result.out.data.ch2.data.dataArray.filter(
          item => !item.pdfBase64 || item.pdfBase64.trim() === ''
        );

        failureItems.forEach((item) => {
          expect(item.pdfBase64).toBeDefined();
          expect(item.pdfBase64).toBe('');
        });

        if (failureItems.length > 0) {
          console.log(`\n[테스트 통과] 실패한 PDF: ${failureItems.length}건 (빈 문자열)`);
        } else {
          console.log('\n[테스트 통과] 모든 PDF 다운로드 성공');
        }
      } catch (error) {
        console.log('\n[테스트 에러] PDF 실패 케이스 테스트 실패:', error);
        throw error;
      }
    });
  });
});
