/**
 * 타입 정의 모듈
 *
 * 시스템에서 사용하는 TypeScript 타입 정의
 * - Input/Output DTO: API 입출력 형식
 * - Internal Types: 내부 처리용 타입
 * - Error Types: 에러 처리용 타입
 */

// ========== Input/Output Types ==========

/**
 * API 입력 데이터 구조
 *
 * @property in.ch2.inqrDate - 조회 날짜 (YYYYMMDD 형식, 선택)
 * @property in.ch2.delayTime - 최소 지연시간 (분, 선택, 기본값: "30")
 * @property in.ch2.pdfDataYn - PDF 생성 여부 ("0" 또는 "1", 선택, 기본값: "0")
 */
export interface InputDTO {
  in: {
    ch2: {
      inqrDate?: string;
      delayTime?: string;
      pdfDataYn?: string;
    }
  }
}

/**
 * API 출력 데이터 구조
 *
 * @property out.code - 응답 코드 (예: "1000200")
 * @property out.msg - 사용자에게 보여줄 메시지
 * @property out.data.ch2 - 표준 응답 형식 (code, msg, dataArray 포함)
 */
export interface OutputDTO {
  out: {
    code: string;
    msg: string;
    data: {
      ch2: {
        code: string;
        msg: string;
        data: {
          dataArray: DelayInfo[]
        }
      }
    }
  }
}

/**
 * 지연 정보
 *
 * @property line - 노선명 (예: "1호선")
 * @property direction - 방향 (예: "상행선")
 * @property timeRange - 시간대 (예: "첫차~09시")
 * @property delayDate - 지연 날짜 (YYMMDD 형식)
 * @property delayStart - 지연 시작 시간 (YYYYMMDDHHmm 형식)
 * @property delayEnd - 지연 종료 시간 (YYYYMMDDHHmm 형식)
 * @property delayTime - 지연 시간 (분)
 * @property pdfBase64 - PDF Base64 인코딩 문자열 (선택)
 */
export interface DelayInfo {
  line: string;
  direction: string;
  timeRange: string;
  delayDate: string;
  delayStart: string;
  delayEnd: string;
  delayTime: string;
  pdfBase64?: string;
}

// ========== Internal Types ==========

/**
 * 검증된 입력 데이터
 *
 * InputDTO에서 추출하여 필수 필드로 변환한 타입
 * 입력 검증 후 기본값이 적용된 필수 필드만 포함
 */
export type ValidatedInput = Required<InputDTO['in']['ch2']>;

/**
 * 스크래핑으로 추출한 지연 정보
 *
 * @property site - 출처 사이트 ('seoulmetro' | 'korail')
 * @property line - 노선명
 * @property direction - 방향,방면
 * @property timeRange - 시간대 (사이트별 형식)
 * @property delayMinutes - 지연 시간 (분, 문자열)
 * @property pdfUrl - PDF 다운로드 URL (선택, pdfDataYn="1"일 때 사용)
 */
export interface ScrapedDelayInfo {
  site: 'seoulmetro' | 'korail';
  line: string;
  direction: string;
  timeRange: string;
  delayMinutes: string;
  pdfUrl?: string;
}

/**
 * 포맷팅된 지연 정보
 *
 * ScrapedDelayInfo를 포맷팅하여 통일된 형식으로 변환한 데이터
 * - 날짜/시간 형식 통일 (delayDate: YYMMDD, delayStart/End: YYYYMMDDHHmm)
 * - 시간대 문자열은 사이트별로 유지
 * - line, direction, timeRange는 ScrapedDelayInfo에서 그대로 사용
 */
export interface FormattedDelayData {
  line: string;
  direction: string;
  timeRange: string;
  delayDate: string;
  delayStart: string;
  delayEnd: string;
  delayTime: string;
  pdfBase64?: string; // pdfDataYn="1"일 때만 설정
}

/**
 * 시간대 매핑
 *
 * 시간대 문자열을 시간 설정으로 매핑하는 정보
 *
 * @property startHour - 시작 시간 (0-23)
 * @property endHour - 종료 시간 (0-23)
 * @property nextDay - 다음날 여부 (막차 시간대의 경우 true)
 */
export interface TimeRangeMapping {
  startHour: number;
  endHour: number;
  nextDay: boolean;
}

// ========== Error Types ==========

/**
 * 입력 검증 에러
 *
 * 입력 데이터 검증 실패 시 발생하는 에러
 *
 * @property code - 에러 코드 (예: "1000016")
 * @property message - 에러 메시지
 */
export class ValidationError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
