/**
 * 응답 포맷팅 유틸리티
 *
 * 스크래핑 결과를 API 응답 형식으로 변환
 */
import { FormattedDelayData, OutputDTO } from '../types';
/**
 * 성공 응답 생성
 *
 * @param dataArray - 포맷팅된 지연 데이터 배열
 * @param hasPartialFailure - 부분 실패 여부
 * @returns OutputDTO
 */
export declare function createSuccessResponse(dataArray: FormattedDelayData[], hasPartialFailure: boolean): OutputDTO;
/**
 * 에러 응답 생성
 *
 * @param code - 에러 코드
 * @param msg - 에러 메시지
 * @returns OutputDTO
 */
export declare function createErrorResponse(code: string, msg: string): OutputDTO;
//# sourceMappingURL=response-formatters.d.ts.map