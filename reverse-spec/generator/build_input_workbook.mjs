import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(import.meta.dirname, "..", "..");
const outputPath = path.join(root, "reverse-spec", "input", "roomflow_function_definition.xlsx");
const previewDir = path.join(root, "reverse-spec", "previews");

const workbook = Workbook.create();
const summary = workbook.worksheets.add("요약");
const screens = workbook.worksheets.add("화면목록");
const fields = workbook.worksheets.add("화면항목정의");
const events = workbook.worksheets.add("버튼이벤트");
const states = workbook.worksheets.add("상태전이");
const messages = workbook.worksheets.add("메시지·권한");
const review = workbook.worksheets.add("검토메모");

const colors = {
  navy: "#142B4A",
  navy2: "#1D3C64",
  blue: "#2F6FED",
  blueLight: "#EAF1FF",
  teal: "#0F8B8D",
  tealLight: "#E6F6F5",
  orange: "#F47A31",
  orangeLight: "#FFF0E7",
  ink: "#202A3A",
  slate: "#627086",
  line: "#D6DCE6",
  soft: "#F5F7FA",
  yellow: "#FFF8D9",
  green: "#E8F6EF",
  red: "#FBECEB",
  white: "#FFFFFF"
};

function titleBand(sheet, title, subtitle, endColumn) {
  sheet.showGridLines = false;
  const titleRange = sheet.getRange(`A1:${endColumn}1`);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format = {
    fill: colors.navy,
    font: { name: "Arial", size: 18, bold: true, color: colors.white },
    verticalAlignment: "center"
  };
  titleRange.format.rowHeight = 34;

  const subtitleRange = sheet.getRange(`A2:${endColumn}2`);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  subtitleRange.format = {
    fill: colors.blueLight,
    font: { name: "Arial", size: 10, color: colors.slate },
    verticalAlignment: "center"
  };
  subtitleRange.format.rowHeight = 25;
  sheet.freezePanes.freezeRows(4);
}

function headerStyle(range) {
  range.format = {
    fill: colors.navy2,
    font: { name: "Arial", size: 10, bold: true, color: colors.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#FFFFFF" }
  };
  range.format.rowHeight = 31;
}

function bodyStyle(range) {
  range.format = {
    font: { name: "Arial", size: 10, color: colors.ink },
    verticalAlignment: "center",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: colors.line },
      bottom: { style: "thin", color: colors.line }
    }
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function addStatusFormatting(range) {
  range.conditionalFormats.add("containsText", {
    text: "확정",
    format: { fill: colors.green, font: { bold: true, color: "#176B4D" } }
  });
  range.conditionalFormats.add("containsText", {
    text: "검토중",
    format: { fill: colors.yellow, font: { bold: true, color: "#8A6900" } }
  });
  range.conditionalFormats.add("containsText", {
    text: "충돌",
    format: { fill: colors.red, font: { bold: true, color: "#B43D35" } }
  });
}

titleBand(summary, "RoomFlow 기능정의서", "회의실 예약 UI · PPT/Excel → SPEC 실습 입력 · Draft v0.8", "H");
summary.getRange("A4:B10").values = [
  ["문서 항목", "내용"],
  ["문서 상태", "Draft"],
  ["대상 시스템", "RoomFlow 회의실 예약 관리"],
  ["핵심 사용자", "임직원 · 신청자 · 승인자"],
  ["핵심 화면", "예약 조회 · 예약 등록 · 내 예약 상세 · 승인함"],
  ["검토 원칙", "검토중·충돌 항목은 확정 요구사항으로 사용하지 않음"],
  ["입력 원본", "화면설계서 PPT v0.8 + 본 기능정의서"]
];
headerStyle(summary.getRange("A4:B4"));
bodyStyle(summary.getRange("A5:B10"));
summary.getRange("A9:B9").format.fill = colors.yellow;

summary.getRange("D4:E11").values = [
  ["자동 집계", "값"],
  ["화면 수", null],
  ["화면 항목 수", null],
  ["버튼 이벤트 수", null],
  ["상태 전이 수", null],
  ["메시지 수", null],
  ["권한 규칙 수", null],
  ["검토 메모 수", null]
];
summary.getRange("E5:E11").formulas = [
  ["=COUNTA('화면목록'!A5:A8)"],
  ["=COUNTA('화면항목정의'!A5:A16)"],
  ["=COUNTA('버튼이벤트'!A5:A13)"],
  ["=COUNTA('상태전이'!A5:A11)"],
  ["=COUNTIF('메시지·권한'!B5:B13,\"MESSAGE\")"],
  ["=COUNTIF('메시지·권한'!B5:B13,\"PERMISSION\")"],
  ["=COUNTA('검토메모'!A5:A10)"]
];
headerStyle(summary.getRange("D4:E4"));
bodyStyle(summary.getRange("D5:E11"));
summary.getRange("E5:E11").format = {
  fill: colors.blueLight,
  font: { name: "Arial", size: 12, bold: true, color: colors.blue },
  horizontalAlignment: "center",
  borders: { insideHorizontal: { style: "thin", color: "#BED1F5" } }
};

summary.getRange("G4:H10").values = [
  ["읽는 순서", "확인 목적"],
  ["1. 화면목록", "화면 ID와 사용자"],
  ["2. 화면항목정의", "필드·필수·검증"],
  ["3. 버튼이벤트", "행동과 성공·실패"],
  ["4. 상태전이", "허용 상태 변화"],
  ["5. 메시지·권한", "오류 코드와 사용자 범위"],
  ["6. 검토메모", "충돌·모호함·범위 밖"]
];
headerStyle(summary.getRange("G4:H4"));
bodyStyle(summary.getRange("G5:H10"));
setWidths(summary, [20, 54, 3, 20, 14, 3, 21, 28]);

titleBand(screens, "화면 목록", "PPT의 화면 ID·화면명·사용자와 대조", "H");
screens.getRange("A4:H8").values = [
  ["화면 ID", "화면명", "사용자", "경로", "최초 조회 범위", "주요 기능", "화면 구분", "상태"],
  ["RFM-100", "예약 조회", "임직원", "/reservations", "오늘부터 30일", "기간·건물·상태 조회, 상세 이동", "Main", "확정"],
  ["RFM-110", "예약 등록", "임직원", "/reservations/new", "해당 없음", "입력, 임시저장, 예약 요청", "Main", "확정"],
  ["RFM-120", "내 예약 상세", "신청자", "/reservations/:id", "해당 없음", "상태·처리 이력 조회, 취소", "Main", "확정"],
  ["RFA-200", "예약 승인함", "승인자", "/approvals", "REQUESTED", "승인, 반려, 처리자 기록", "Main", "확정"]
];
headerStyle(screens.getRange("A4:H4"));
bodyStyle(screens.getRange("A5:H8"));
screens.getRange("H5:H8").dataValidation = { rule: { type: "list", values: ["확정", "검토중"] } };
addStatusFormatting(screens.getRange("H5:H8"));
screens.getRange("E5").format.fill = colors.yellow;
setWidths(screens, [15, 21, 14, 28, 22, 40, 14, 12]);

titleBand(fields, "화면 항목 정의", "입력 주체, 필수 여부, 타입, 검증 규칙을 셀 위치로 추적", "I");
fields.getRange("A4:I16").values = [
  ["항목 ID", "화면 ID", "항목명", "UI 타입", "필수", "입력 주체", "검증 규칙", "오류 코드", "상태"],
  ["FLD-001", "RFM-100", "조회 기간", "Date range", "Y", "사용자", "시작일은 종료일보다 늦을 수 없음", "INVALID_DATE_RANGE", "확정"],
  ["FLD-002", "RFM-100", "건물", "Select", "N", "사용자", "등록된 건물 코드만 선택", "", "확정"],
  ["FLD-003", "RFM-100", "예약 상태", "Multi select", "N", "사용자", "상태전이 시트의 상태만 선택", "", "확정"],
  ["FLD-004", "RFM-110", "회의실", "Room picker", "Y", "사용자", "활성 회의실만 선택", "ROOM_NOT_AVAILABLE", "확정"],
  ["FLD-005", "RFM-110", "예약일", "Date", "Y", "사용자", "과거 일자 선택 불가", "PAST_DATE", "확정"],
  ["FLD-006", "RFM-110", "시작 시각", "Time", "Y", "사용자", "30분 단위", "INVALID_TIME", "확정"],
  ["FLD-007", "RFM-110", "종료 시각", "Time", "Y", "사용자", "시작 시각보다 늦고 30분 단위", "INVALID_TIME", "확정"],
  ["FLD-008", "RFM-110", "참석 인원", "Number", "Y", "사용자", "1 이상, 회의실 정원 이하", "CAPACITY_EXCEEDED", "확정"],
  ["FLD-009", "RFM-110", "예약 제목", "Text", "Y", "사용자", "1~60자", "TITLE_REQUIRED", "확정"],
  ["FLD-010", "RFM-110", "예약 목적", "Textarea", "N", "사용자", "최대 300자", "", "검토중"],
  ["FLD-011", "RFA-200", "반려 사유", "Textarea", "조건부", "승인자", "반려 시 필수, 최대 300자", "REJECTION_REASON_REQUIRED", "확정"],
  ["FLD-012", "RFM-120", "예약 상태", "Badge", "N", "시스템", "상태전이 시트의 상태만 표시", "INVALID_STATUS", "확정"]
];
headerStyle(fields.getRange("A4:I4"));
bodyStyle(fields.getRange("A5:I16"));
fields.getRange("E5:E16").dataValidation = { rule: { type: "list", values: ["Y", "N", "조건부"] } };
fields.getRange("F5:F16").dataValidation = { rule: { type: "list", values: ["사용자", "승인자", "시스템"] } };
fields.getRange("I5:I16").dataValidation = { rule: { type: "list", values: ["확정", "검토중"] } };
addStatusFormatting(fields.getRange("I5:I16"));
fields.getRange("A14:I14").format.fill = colors.yellow;
setWidths(fields, [15, 15, 20, 18, 11, 14, 42, 29, 13]);

titleBand(events, "버튼·이벤트 정의", "버튼 조건, 성공 상태, 실패 상태와 데이터 보존 규칙", "J");
events.getRange("A4:J13").values = [
  ["이벤트 ID", "화면 ID", "버튼/이벤트", "실행 조건", "시스템 동작", "성공 결과", "실패 결과", "오류 코드", "우선순위", "상태"],
  ["EVT-001", "RFM-100", "조회", "조회 기간이 유효함", "기간·건물·상태 조건으로 검색", "목록과 건수 표시", "기존 조건 유지", "INVALID_DATE_RANGE", "Must", "확정"],
  ["EVT-002", "RFM-110", "임시저장", "필수 초안 항목 입력", "예약을 DRAFT로 저장", "상세 화면 이동", "입력값 유지", "SAVE_FAILED", "Should", "확정"],
  ["EVT-003", "RFM-110", "예약 요청", "필수값과 검증 통과", "중복 시간 확인 후 REQUESTED 저장", "승인함에 표시", "예약 미생성, 입력값 유지", "OVERLAPPED_RESERVATION", "Must", "확정"],
  ["EVT-004", "RFM-120", "예약 취소", "APPROVED이며 시작 4시간 전까지", "상태를 CANCELED로 변경", "취소 이력 표시", "상태 변경 없음", "CANCEL_WINDOW_EXPIRED", "Must", "검토중"],
  ["EVT-005", "RFA-200", "승인", "REQUESTED이며 승인자 권한 보유", "상태 APPROVED, 처리자·처리시각 기록", "승인함에서 제거", "기존 상태 유지", "ALREADY_PROCESSED", "Must", "확정"],
  ["EVT-006", "RFA-200", "반려", "REQUESTED이며 반려 사유 입력", "상태 REJECTED, 사유·처리자 기록", "승인함에서 제거", "기존 상태와 입력 사유 유지", "REJECTION_REASON_REQUIRED", "Must", "확정"],
  ["EVT-007", "RFM-110", "시간 변경", "시작·종료 또는 회의실 변경", "겹침과 정원을 다시 검증", "변경값 표시", "입력값 유지", "OVERLAPPED_RESERVATION", "Must", "확정"],
  ["EVT-008", "RFM-120", "상세 열기", "본인 예약 또는 승인 대상", "예약과 처리 이력 조회", "상세 표시", "접근 거절", "FORBIDDEN", "Must", "확정"],
  ["EVT-009", "RFA-200", "대리 승인", "관리자 권한", "승인자 대신 처리", "처리자 기록", "접근 거절", "FORBIDDEN", "Could", "검토중"]
];
headerStyle(events.getRange("A4:J4"));
bodyStyle(events.getRange("A5:J13"));
events.getRange("I5:I13").dataValidation = { rule: { type: "list", values: ["Must", "Should", "Could"] } };
events.getRange("J5:J13").dataValidation = { rule: { type: "list", values: ["확정", "검토중"] } };
addStatusFormatting(events.getRange("J5:J13"));
events.getRange("A8:J8").format.fill = colors.yellow;
events.getRange("A13:J13").format.fill = colors.yellow;
setWidths(events, [15, 14, 20, 37, 42, 30, 32, 29, 13, 13]);

titleBand(states, "예약 상태 전이", "허용된 이전 상태에서만 다음 상태로 이동", "H");
states.getRange("A4:H11").values = [
  ["전이 ID", "현재 상태", "이벤트", "다음 상태", "행위자", "허용 조건", "실패 결과", "상태"],
  ["ST-001", "없음", "임시저장", "DRAFT", "신청자", "초안 필수 항목 입력", "예약 미생성", "확정"],
  ["ST-002", "없음", "예약 요청", "REQUESTED", "신청자", "전체 입력 검증 통과", "예약 미생성", "확정"],
  ["ST-003", "DRAFT", "예약 요청", "REQUESTED", "신청자", "전체 입력 검증 통과", "DRAFT 유지", "확정"],
  ["ST-004", "REQUESTED", "승인", "APPROVED", "승인자", "미처리 요청", "REQUESTED 유지", "확정"],
  ["ST-005", "REQUESTED", "반려", "REJECTED", "승인자", "반려 사유 입력", "REQUESTED 유지", "확정"],
  ["ST-006", "APPROVED", "취소", "CANCELED", "신청자", "취소 정책 충족", "APPROVED 유지", "확정"],
  ["ST-007", "APPROVED/REJECTED/CANCELED", "승인 또는 반려", "변경 없음", "승인자", "항상 거절", "기존 상태 유지", "확정"]
];
headerStyle(states.getRange("A4:H4"));
bodyStyle(states.getRange("A5:H11"));
states.getRange("H5:H11").dataValidation = { rule: { type: "list", values: ["확정", "검토중"] } };
addStatusFormatting(states.getRange("H5:H11"));
setWidths(states, [14, 25, 20, 20, 15, 35, 30, 13]);

titleBand(messages, "메시지·권한 정의", "사용자 메시지와 화면 접근 규칙을 한 시트에서 관리", "H");
messages.getRange("A4:H13").values = [
  ["정의 ID", "분류", "적용 화면", "조건/역할", "표시 문구 또는 권한", "시스템 결과", "상태", "비고"],
  ["MSG-001", "MESSAGE", "RFM-110", "종료≤시작", "종료 시각을 확인해주세요.", "입력값 유지", "확정", "INVALID_TIME"],
  ["MSG-002", "MESSAGE", "RFM-110", "인원>정원", "선택한 회의실의 정원을 초과했습니다.", "입력값 유지", "확정", "CAPACITY_EXCEEDED"],
  ["MSG-003", "MESSAGE", "RFM-110", "시간 중복", "같은 시간에 이미 예약된 회의실입니다.", "예약 미생성", "확정", "OVERLAPPED_RESERVATION"],
  ["MSG-004", "MESSAGE", "RFA-200", "이미 처리됨", "이미 처리된 예약입니다.", "기존 상태 유지", "확정", "ALREADY_PROCESSED"],
  ["MSG-005", "MESSAGE", "공통", "서버 오류", "요청을 처리하지 못했습니다. 다시 시도해주세요.", "화면 입력값 유지", "확정", "일반 오류"],
  ["PERM-001", "PERMISSION", "RFM-100/110", "임직원", "예약 조회와 등록 가능", "본인 데이터 중심", "확정", ""],
  ["PERM-002", "PERMISSION", "RFM-120", "신청자", "본인 예약 상세와 취소 가능", "타인 상세 접근 거절", "확정", ""],
  ["PERM-003", "PERMISSION", "RFA-200", "승인자", "담당 조직의 REQUESTED 처리 가능", "처리자 기록", "확정", ""],
  ["PERM-004", "PERMISSION", "RFA-200", "관리자", "대리 승인 가능 여부 검토", "미정", "검토중", "정책 승인 필요"]
];
headerStyle(messages.getRange("A4:H4"));
bodyStyle(messages.getRange("A5:H13"));
messages.getRange("B5:B13").dataValidation = { rule: { type: "list", values: ["MESSAGE", "PERMISSION"] } };
messages.getRange("G5:G13").dataValidation = { rule: { type: "list", values: ["확정", "검토중"] } };
addStatusFormatting(messages.getRange("G5:G13"));
messages.getRange("A13:H13").format.fill = colors.yellow;
setWidths(messages, [16, 17, 22, 27, 48, 32, 13, 25]);

titleBand(review, "충돌·모호함 검토 메모", "이 시트의 값은 SPEC 확정 요구사항이 아니라 OPEN 질문 후보", "G");
review.getRange("A4:G10").values = [
  ["OPEN ID", "분류", "주제", "PPT 주장", "Excel 주장", "결정 영향", "상태"],
  ["OPEN-001", "conflict", "기본 조회 기간", "오늘부터 7일", "오늘부터 30일", "초기 조회 조건과 성능", "미결정"],
  ["OPEN-002", "conflict", "취소 가능 시점", "시작 2시간 전(제안)", "시작 4시간 전(검토중)", "취소 버튼과 오류 조건", "미결정"],
  ["OPEN-003", "conflict", "예약 목적 필수", "필수 표시 및 규칙", "필수 N, 검토중", "폼 검증과 데이터 모델", "미결정"],
  ["OPEN-004", "ambiguous", "조회 응답", "사용자가 기다리지 않게 빠르게", "측정 기준 없음", "NFR과 성능 테스트", "미결정"],
  ["OPEN-005", "candidate", "취소 알림 채널", "이메일 또는 앱 알림", "명시 없음", "알림 구현 범위", "미결정"],
  ["OUT-001", "out-of-scope", "후속 기능", "반복 예약·출입 QR 제외", "명시 없음", "MVP 범위", "제외"]
];
headerStyle(review.getRange("A4:G4"));
bodyStyle(review.getRange("A5:G10"));
review.getRange("B5:B10").dataValidation = { rule: { type: "list", values: ["conflict", "ambiguous", "candidate", "out-of-scope"] } };
review.getRange("G5:G10").dataValidation = { rule: { type: "list", values: ["미결정", "제외"] } };
review.getRange("A5:G9").format.fill = colors.yellow;
review.getRange("A10:G10").format.fill = colors.soft;
setWidths(review, [16, 18, 24, 38, 38, 35, 13]);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

for (const sheetName of ["요약", "화면목록", "화면항목정의", "버튼이벤트", "상태전이", "메시지·권한", "검토메모"]) {
  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1.25,
    format: "png"
  });
  const previewPath = path.join(previewDir, `roomflow_${sheetName}.png`);
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
}

const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "요약!A1:H11",
  include: "values,formulas",
  tableMaxRows: 11,
  tableMaxCols: 8
});
console.log(summaryCheck.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
console.log(formulaErrors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`created: ${outputPath}`);
