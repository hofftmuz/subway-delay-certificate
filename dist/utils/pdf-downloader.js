"use strict";
/**
 * PDF 다운로더 유틸리티
 *
 * Puppeteer를 사용하여 HTML을 PDF로 변환하고 Base64로 인코딩
 * - 서울교통공사: delayProofPrint.do HTML → PDF
 * - 코레일: delaylistDetail.jsp HTML → PDF
 * - 실제 URL로 직접 이동하여 모든 외부 리소스(이미지, CSS, 폰트) 자동 로드
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPdfAsBase64 = downloadPdfAsBase64;
exports.downloadMultiplePdfs = downloadMultiplePdfs;
const puppeteer_1 = __importDefault(require("puppeteer"));
const http_config_1 = require("../config/http-config");
/**
 * PDF 다운로드 및 Base64 인코딩
 *
 * @param pdfUrl - PDF 다운로드 URL (HTML 페이지)
 * @param site - 사이트 타입 ('seoulmetro' | 'korail')
 * @returns Base64 인코딩된 PDF 문자열 (실패 시 빈 문자열)
 */
async function downloadPdfAsBase64(pdfUrl, site) {
    let browser = null;
    try {
        console.log(`[PdfDownloader] PDF 다운로드 시작: ${pdfUrl}`);
        // 1. Puppeteer 브라우저 실행
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        // 2. User-Agent 설정
        await page.setUserAgent(http_config_1.USER_AGENT);
        // 3. 실제 URL로 직접 이동 (모든 외부 리소스 자동 로드)
        await page.goto(pdfUrl, {
            waitUntil: 'networkidle0', // 모든 네트워크 요청 완료 대기
            timeout: 20000 // 20초로 증가
        });
        // 4. 추가 대기 (이미지, CSS, 폰트 로드 완료 대기)
        await page.waitForTimeout(2000); // 2초로 증가
        // 5. PDF 생성
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // 배경 이미지 포함
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });
        // 6. Base64 인코딩
        const base64 = pdfBuffer.toString('base64');
        console.log(`[PdfDownloader] PDF 다운로드 완료: ${base64.length} characters`);
        return base64;
    }
    catch (error) {
        // Puppeteer 에러 처리
        if (error instanceof Error) {
            if (error.message.includes('Navigation timeout') || error.message.includes('Timeout')) {
                console.error('[PdfDownloader] 페이지 로드 타임아웃:', pdfUrl);
            }
            else if (error.message.includes('net::ERR')) {
                console.error('[PdfDownloader] 네트워크 에러 발생:', {
                    message: error.message,
                    url: pdfUrl,
                });
            }
            else {
                console.error('[PdfDownloader] PDF 다운로드 실패:', {
                    message: error.message,
                    url: pdfUrl,
                });
            }
        }
        else {
            console.error('[PdfDownloader] PDF 다운로드 실패 (기타 에러):', error);
        }
        // 에러 발생 시 빈 문자열 반환
        return '';
    }
    finally {
        // 7. 브라우저 종료
        if (browser) {
            await browser.close().catch(err => {
                console.error('[PdfDownloader] 브라우저 종료 실패:', err);
            });
        }
    }
}
/**
 * 여러 PDF를 병렬로 다운로드
 *
 * @param pdfUrls - PDF URL 배열 (site와 함께)
 * @returns Base64 인코딩된 PDF 문자열 배열
 */
async function downloadMultiplePdfs(pdfUrls) {
    console.log(`[PdfDownloader] 병렬 PDF 다운로드 시작: ${pdfUrls.length}건`);
    // 병렬로 다운로드 (각각 독립적인 브라우저 인스턴스 사용)
    const promises = pdfUrls.map(({ url, site }) => downloadPdfAsBase64(url, site).catch(error => {
        console.error(`[PdfDownloader] 개별 PDF 다운로드 실패: ${url}`, error);
        return ''; // 실패 시 빈 문자열 반환
    }));
    const results = await Promise.all(promises);
    console.log(`[PdfDownloader] 병렬 PDF 다운로드 완료: ${results.filter(r => r).length}/${pdfUrls.length}건 성공`);
    return results;
}
//# sourceMappingURL=pdf-downloader.js.map