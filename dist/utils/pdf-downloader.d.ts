/**
 * PDF 다운로더 유틸리티
 *
 * Puppeteer를 사용하여 HTML을 PDF로 변환하고 Base64로 인코딩
 * - 서울교통공사: delayProofPrint.do HTML → PDF
 * - 코레일: delaylistDetail.jsp HTML → PDF
 * - 실제 URL로 직접 이동하여 모든 외부 리소스(이미지, CSS, 폰트) 자동 로드
 */
/**
 * PDF 다운로드 및 Base64 인코딩
 *
 * @param pdfUrl - PDF 다운로드 URL (HTML 페이지)
 * @param site - 사이트 타입 ('seoulmetro' | 'korail')
 * @returns Base64 인코딩된 PDF 문자열 (실패 시 빈 문자열)
 */
export declare function downloadPdfAsBase64(pdfUrl: string, site: 'seoulmetro' | 'korail'): Promise<string>;
/**
 * 여러 PDF를 병렬로 다운로드
 *
 * @param pdfUrls - PDF URL 배열 (site와 함께)
 * @returns Base64 인코딩된 PDF 문자열 배열
 */
export declare function downloadMultiplePdfs(pdfUrls: Array<{
    url: string;
    site: 'seoulmetro' | 'korail';
}>): Promise<string[]>;
//# sourceMappingURL=pdf-downloader.d.ts.map