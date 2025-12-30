/**
 * 메인 진입점
 *
 * API 요청을 처리하는 핸들러 함수
 * - 입력 검증
 * - 서비스 호출
 * - 에러 처리 및 응답 생성
 */
import { InputDTO, OutputDTO } from './types';
/**
 * 메인 핸들러 함수
 *
 * Node.js 서버 함수 형식으로 작성
 *
 * @param input - API 입력 데이터
 * @returns API 출력 데이터
 */
export declare function handler(input: InputDTO): Promise<OutputDTO>;
//# sourceMappingURL=index.d.ts.map