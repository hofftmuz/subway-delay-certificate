/**
 * 입력 데이터 검증 유틸리티
 *
 * API 입력 데이터를 검증하고 기본값을 적용하여 ValidatedInput을 반환
 */

import { format, parse, isFuture, startOfDay } from 'date-fns';
import { InputDTO, ValidatedInput, ValidationError } from '../types';
import { ERROR_CODES } from '../config/error-codes';

/**
 * 입력 데이터 검증 및 기본값 적용
 *
 * @param input - API 입력 데이터
 * @returns 검증된 입력 데이터 (기본값 적용)
 * @throws ValidationError - 검증 실패 시
 */
export function validateInput(input: InputDTO): ValidatedInput {
  // 각 필드 검증 및 기본값 적용
  const inqrDate = validateInqrDate(input.in?.ch2?.inqrDate);
  const delayTime = validateDelayTime(input.in?.ch2?.delayTime);
  const pdfDataYn = validatePdfDataYn(input.in?.ch2?.pdfDataYn);

  return {
    inqrDate,
    delayTime,
    pdfDataYn
  };
}

/**
 * 조회 날짜 검증
 *
 * @param inqrDate - 조회 날짜 (YYYYMMDD 형식, 선택)
 * @returns 검증된 날짜 (YYYYMMDD 형식)
 * @throws ValidationError - 검증 실패 시
 */
function validateInqrDate(inqrDate?: string): string {
  // 기본값 처리 및 빈 문자열 체크
  // - undefined/null: 기본값 (오늘 날짜) 반환
  // - 빈 문자열(""): 에러 발생 (잘못된 값으로 간주)
  if (!inqrDate || inqrDate === '') {
    if (inqrDate === '') {
      throw new ValidationError(
        ERROR_CODES.INVALID_DATE_FORMAT.code,
        ERROR_CODES.INVALID_DATE_FORMAT.msg
      );
    }
    return format(startOfDay(new Date()), 'yyyyMMdd');
  }

  // 형식 검증: 8자리 숫자만 허용 (YYYYMMDD)
  if (!/^\d{8}$/.test(inqrDate)) {
    throw new ValidationError(
      ERROR_CODES.INVALID_DATE_FORMAT.code,
      ERROR_CODES.INVALID_DATE_FORMAT.msg
    );
  }

  // 날짜 파싱: 문자열을 Date 객체로 변환
  let date: Date;
  try {
    date = parse(inqrDate, 'yyyyMMdd', new Date());
  } catch (error) {
    throw new ValidationError(
      ERROR_CODES.INVALID_DATE_FORMAT.code,
      ERROR_CODES.INVALID_DATE_FORMAT.msg
    );
  }

  // 유효한 날짜인지 확인
  // date-fns v2.30.0에서는 유효하지 않은 날짜 (예: 20251301, 20250230)가 Invalid Date를 반환함
  // Invalid Date는 format() 시 RangeError를 발생시키므로 catch 블록에서 처리
  // 유효한 날짜: format() 성공 후 원본과 비교하여 일치 여부 확인
  try {
    const formatted = format(date, 'yyyyMMdd');
    if (formatted !== inqrDate) {
      throw new ValidationError(
        ERROR_CODES.INVALID_DATE_FORMAT.code,
        ERROR_CODES.INVALID_DATE_FORMAT.msg
      );
    }
  } catch (error) {
    // format()에서 RangeError 발생 시 (Invalid Date인 경우)
    if (error instanceof RangeError || error instanceof Error) {
      throw new ValidationError(
        ERROR_CODES.INVALID_DATE_FORMAT.code,
        ERROR_CODES.INVALID_DATE_FORMAT.msg
      );
    }
    throw error;
  }

  // 미래 날짜 체크: 오늘 이후 날짜는 허용하지 않음
  if (isFuture(startOfDay(date))) {
    throw new ValidationError(
      ERROR_CODES.FUTURE_DATE.code,
      ERROR_CODES.FUTURE_DATE.msg
    );
  }

  return inqrDate;
}

/**
 * 최소 지연시간 검증
 *
 * @param delayTime - 최소 지연시간 (분, 선택)
 * @returns 검증된 지연시간 (문자열)
 * @throws ValidationError - 검증 실패 시
 */
function validateDelayTime(delayTime?: string): string {
  // 기본값 처리 및 빈 문자열 체크
  // - undefined/null: 기본값 "30" 반환
  // - 빈 문자열(""): 에러 발생 (잘못된 값으로 간주)
  if (!delayTime || delayTime === '') {
    if (delayTime === '') {
      throw new ValidationError(
        ERROR_CODES.INVALID_INPUT.code,
        ERROR_CODES.INVALID_INPUT.msg
      );
    }
    return '30';
  }

  // 숫자 형식 검증
  // - parseInt()로 숫자 변환 시도
  // - NaN이면 에러
  // - 변환 후 toString()과 원본을 직접 비교하여 "30.5", "30abc", " 30 ", "0030" 같은 케이스 제외
  // 실패 예시: "abc", "30.5", "30abc", " 30 ", "0030"
  const numValue = parseInt(delayTime, 10);
  if (isNaN(numValue) || numValue.toString() !== delayTime) {
    throw new ValidationError(
      ERROR_CODES.INVALID_INPUT.code,
      ERROR_CODES.INVALID_INPUT.msg
    );
  }

  // 음수 체크: 0 이상의 값만 허용
  if (numValue < 0) {
    throw new ValidationError(
      ERROR_CODES.INVALID_INPUT.code,
      ERROR_CODES.INVALID_INPUT.msg
    );
  }

  return delayTime;
}

/**
 * PDF 생성 여부 검증
 *
 * @param pdfDataYn - PDF 생성 여부 ("0" 또는 "1", 선택)
 * @returns 검증된 PDF 생성 여부 ("0" 또는 "1")
 * @throws ValidationError - 검증 실패 시
 */
function validatePdfDataYn(pdfDataYn?: string): string {
  // 기본값 처리 및 빈 문자열 체크
  // - undefined/null: 기본값 "0" 반환
  // - 빈 문자열(""): 에러 발생 (잘못된 값으로 간주)
  if (!pdfDataYn || pdfDataYn === '') {
    if (pdfDataYn === '') {
      throw new ValidationError(
        ERROR_CODES.INVALID_INPUT.code,
        ERROR_CODES.INVALID_INPUT.msg
      );
    }
    return '0';
  }

  // 허용 값 체크: "0" 또는 "1"만 허용
  if (pdfDataYn !== '0' && pdfDataYn !== '1') {
    throw new ValidationError(
      ERROR_CODES.INVALID_INPUT.code,
      ERROR_CODES.INVALID_INPUT.msg
    );
  }

  return pdfDataYn;
}
