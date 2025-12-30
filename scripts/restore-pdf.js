#!/usr/bin/env node
/**
 * Base64 PDF 추출 및 복원 스크립트
 *
 * 사용법:
 *   node scripts/restore-pdf.js                    // scripts/temp.json 사용
 *   node scripts/restore-pdf.js <json_file_path>   // JSON 파일에서 추출
 *
 *   - JSON 파일은 { "out": { ... } } 형식이어야 합니다.
 *   - JSON 파일의 dataArray[0]에서 pdfBase64 필드를 추출합니다.
 *   - pdfBase64 필드가 있는 JSON 파일만 사용 가능합니다.
 */

const fs = require('fs');
const path = require('path');

function extractPdfBase64FromJson(jsonFilePath) {
  try {
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    let jsonData;
    try {
      jsonData = JSON.parse(jsonContent);
    } catch (parseError) {
      throw new Error(`유효하지 않은 JSON 형식입니다. JSON 파일은 { "out": { ... } } 형식이어야 합니다. 오류: ${parseError.message}`);
    }

    const dataArray = jsonData?.out?.data?.ch2?.data?.dataArray;
    if (!dataArray || !Array.isArray(dataArray)) {
      throw new Error('dataArray를 찾을 수 없습니다.');
    }

    const pdfBase64 = dataArray[0]?.pdfBase64;
    if (!pdfBase64 || pdfBase64.length === 0) {
      throw new Error('dataArray[0]에 pdfBase64가 없습니다. pdfBase64 필드가 있는 JSON 파일을 사용해주세요.');
    }

    return pdfBase64;
  } catch (error) {
    console.error(`JSON에서 pdfBase64 추출 실패:`, error.message);
    throw error;
  }
}


function restorePdfFromBase64(base64String, outputPath) {
  try {
    const pdfBuffer = Buffer.from(base64String, 'base64');
    fs.writeFileSync(outputPath, pdfBuffer);

    const header = pdfBuffer.slice(0, 4).toString();
    if (header === '%PDF') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`PDF 복원 실패:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let base64String = null;
  let outputFileName = 'restored_pdf';
  let jsonFilePath = null;

  if (args.length === 0) {
    // 기본값: scripts/temp.json 사용
    jsonFilePath = path.join(__dirname, 'temp.json');
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`오류: JSON 파일을 찾을 수 없습니다: ${jsonFilePath}`);
      console.error('사용법: node scripts/restore-pdf.js [json_file_path]');
      process.exit(1);
    }
    console.log(`JSON 파일에서 추출: ${jsonFilePath}`);
    base64String = extractPdfBase64FromJson(jsonFilePath);
    outputFileName = 'restored_temp';
  } else if (args.length === 1) {
    jsonFilePath = args[0];

    if (!fs.existsSync(jsonFilePath)) {
      console.error(`오류: JSON 파일을 찾을 수 없습니다: ${jsonFilePath}`);
      process.exit(1);
    }
    console.log(`JSON 파일에서 추출: ${jsonFilePath}`);
    base64String = extractPdfBase64FromJson(jsonFilePath);
    outputFileName = `restored_${path.basename(jsonFilePath, path.extname(jsonFilePath))}`;
  } else {
    console.error('오류: 인자가 너무 많습니다.');
    console.error('사용법: node scripts/restore-pdf.js [json_file_path]');
    process.exit(1);
  }

  if (!base64String || base64String.length === 0) {
    console.error('Base64 데이터가 없습니다.');
    process.exit(1);
  }

  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = path.join(outputDir, `${outputFileName}_${timestamp}.pdf`);

  const success = restorePdfFromBase64(base64String, outputPath);

  if (success) {
    console.log(`\nPDF 파일 위치: ${outputPath}`);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractPdfBase64FromJson, restorePdfFromBase64 };

