/**
 * 입력 데이터 검증 유틸리티
 *
 * API 입력 데이터를 검증하고 기본값을 적용하여 ValidatedInput을 반환
 */
import { InputDTO, ValidatedInput } from '../types';
/**
 * 입력 데이터 검증 및 기본값 적용
 *
 * @param input - API 입력 데이터
 * @returns 검증된 입력 데이터 (기본값 적용)
 * @throws ValidationError - 검증 실패 시
 */
export declare function validateInput(input: InputDTO): ValidatedInput;
//# sourceMappingURL=input-validator.d.ts.map