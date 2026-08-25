#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");

const moduleCandidates = [
  process.env.PPTX_NODE_MODULES,
  path.join(__dirname, "node_modules"),
  path.join(__dirname, "..", "..", "presentation", "generator", "node_modules")
].filter(Boolean);
process.env.NODE_PATH = moduleCandidates.concat(process.env.NODE_PATH || "").join(path.delimiter);
Module._initPaths();

const PptxGenJS = require("pptxgenjs");
const ROOT = path.resolve(__dirname, "..", "..");
const outline = JSON.parse(fs.readFileSync(path.join(__dirname, "input_ppt_outline.json"), "utf8"));
const outputPath = path.join(ROOT, "reverse-spec", "input", "roomflow_screen_definition.pptx");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "SCREEN_SPEC", width: 13.333, height: 7.5 });
pptx.layout = "SCREEN_SPEC";
pptx.author = "Agent AI Workshop";
pptx.company = "Synthetic Workshop Material";
pptx.subject = "UI screen definition for Office to SPEC practice";
pptx.title = outline.title;
pptx.lang = "ko-KR";
const FONT = process.env.PPT_FONT || "에스코어 드림 4 Regular";
pptx.theme = { headFontFace: FONT, bodyFontFace: FONT, lang: "ko-KR" };

const S = pptx.ShapeType;
const C = {
  navy: "142B4A",
  navy2: "1D3C64",
  blue: "2F6FED",
  blueLight: "EAF1FF",
  teal: "0F8B8D",
  tealLight: "E6F6F5",
  orange: "F47A31",
  orangeLight: "FFF0E7",
  ink: "202A3A",
  slate: "627086",
  line: "D6DCE6",
  soft: "F5F7FA",
  white: "FFFFFF",
  green: "17845B",
  greenLight: "E8F6EF",
  red: "C8453C",
  redLight: "FBECEB",
  yellow: "E6A700",
  yellowLight: "FFF8D9"
};

function rect(slide, x, y, w, h, fill, line, radius = 0) {
  slide.addShape(radius ? S.roundRect : S.rect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: line || fill, width: (line || fill) === fill ? 0.5 : 0.8 },
    radius
  });
}

function line(slide, x, y, w, h, color = C.line, width = 1, dash = "solid") {
  slide.addShape(S.line, { x, y, w, h, line: { color, width, dash } });
}

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, Object.assign({
    x, y, w, h,
    fontFace: FONT,
    fontSize: 10,
    color: C.ink,
    bold: false,
    align: "left",
    valign: "mid",
    margin: 0,
    breakLine: false,
    fit: "shrink"
  }, options));
}

function callout(slide, number, x, y) {
  slide.addShape(S.ellipse, {
    x, y, w: 0.28, h: 0.28,
    fill: { color: C.orange },
    line: { color: C.white, width: 1 }
  });
  text(slide, String(number), x, y + 0.01, 0.28, 0.24, {
    fontSize: 9, color: C.white, bold: true, align: "center"
  });
}

function footer(slide, page) {
  line(slide, 0.35, 7.16, 12.63, 0, C.line, 0.6);
  text(slide, "Office → SPEC 실습용 가상 화면설계서 · Draft", 0.4, 7.2, 5.8, 0.18, {
    fontSize: 7.5, color: C.slate
  });
  text(slide, String(page).padStart(2, "0"), 12.25, 7.2, 0.65, 0.18, {
    fontSize: 8, color: C.navy, bold: true, align: "right"
  });
}

function documentHeader(slide, title, page) {
  rect(slide, 0, 0, 13.333, 0.6, C.navy);
  rect(slide, 0, 0, 0.16, 0.6, C.orange);
  text(slide, "ROOMFLOW", 0.36, 0.08, 1.35, 0.32, {
    fontSize: 10.5, color: C.white, bold: true
  });
  text(slide, title, 1.75, 0.07, 8.6, 0.36, {
    fontSize: 20, color: C.white, bold: true
  });
  text(slide, "UI DESIGN SPEC · v0.8", 10.8, 0.11, 2.1, 0.24, {
    fontSize: 8.5, color: "DCE7F7", align: "right"
  });
  footer(slide, page);
}

function metaStrip(slide, data) {
  const y = 0.72;
  const widths = [1.05, 2.05, 0.85, 1.45, 0.75, 1.3, 0.75, 1.05];
  const values = ["화면 ID", data.screen_id, "사용자", data.role, "상태", data.status, "구분", "Main"];
  let x = 0.38;
  values.forEach((value, index) => {
    const isLabel = index % 2 === 0;
    rect(slide, x, y, widths[index], 0.38, isLabel ? "D9DEE6" : C.white, C.line);
    text(slide, value, x + 0.08, y + 0.03, widths[index] - 0.16, 0.28, {
      fontSize: isLabel ? 8.5 : 9.2,
      bold: isLabel || index === 1,
      color: isLabel ? C.navy : C.ink,
      align: isLabel ? "center" : "left"
    });
    x += widths[index];
  });
  rect(slide, 10.02, y, 2.92, 0.38, C.blueLight, "BFD1F5");
  text(slide, "화면과 설명의 번호를 함께 대조", 10.15, y + 0.03, 2.64, 0.28, {
    fontSize: 8.6, color: C.blue, bold: true, align: "center"
  });
}

function rulePanel(slide, rules) {
  const x = 9.62;
  const y = 1.22;
  const w = 3.32;
  const h = 5.72;
  rect(slide, x, y, w, h, C.white, C.line);
  rect(slide, x, y, w, 0.46, "D9DEE6", "C3CAD5");
  text(slide, "FUNCTION / VALIDATION", x + 0.16, y + 0.08, w - 0.32, 0.24, {
    fontSize: 9.8, color: C.navy, bold: true
  });
  rules.forEach((rule, index) => {
    const itemY = y + 0.62 + index * 0.95;
    callout(slide, index + 1, x + 0.16, itemY + 0.02);
    text(slide, rule, x + 0.56, itemY, w - 0.72, 0.67, {
      fontSize: 9.4,
      color: index === 4 ? C.slate : C.ink,
      bold: index === 0,
      valign: "top",
      margin: 0.02
    });
    if (index < rules.length - 1) {
      line(slide, x + 0.16, itemY + 0.79, w - 0.32, 0, "E5E9EF", 0.6);
    }
  });
}

function appFrame(slide, title) {
  const x = 0.38;
  const y = 1.22;
  const w = 9.02;
  const h = 5.72;
  rect(slide, x, y, w, h, C.white, "BFC7D3");
  rect(slide, x, y, w, 0.42, C.navy2, C.navy2);
  text(slide, "RoomFlow", x + 0.22, y + 0.08, 1.0, 0.22, {
    fontSize: 9.5, color: C.white, bold: true
  });
  text(slide, "예약 조회", x + 1.55, y + 0.08, 0.9, 0.22, {
    fontSize: 8, color: "D9E4F4"
  });
  text(slide, "내 예약", x + 2.7, y + 0.08, 0.8, 0.22, {
    fontSize: 8, color: "D9E4F4"
  });
  text(slide, "승인함", x + 3.75, y + 0.08, 0.8, 0.22, {
    fontSize: 8, color: "D9E4F4"
  });
  text(slide, "김사용자", x + 7.95, y + 0.08, 0.72, 0.22, {
    fontSize: 7.6, color: C.white, align: "right"
  });
  rect(slide, x, y + 0.42, 1.35, h - 0.42, C.soft, "E3E7ED");
  const menus = ["예약 조회", "예약 등록", "내 예약", "승인함"];
  menus.forEach((menu, index) => {
    const active = menu === title;
    if (active) rect(slide, x + 0.1, y + 0.74 + index * 0.42, 1.12, 0.32, C.blueLight, C.blueLight, 0.08);
    text(slide, menu, x + 0.23, y + 0.79 + index * 0.42, 0.9, 0.18, {
      fontSize: 7.6, color: active ? C.blue : C.slate, bold: active
    });
  });
  text(slide, title, x + 1.65, y + 0.62, 4.5, 0.34, {
    fontSize: 15, color: C.navy, bold: true
  });
  return { x: x + 1.65, y: y + 1.08, w: w - 1.95, h: h - 1.33 };
}

function field(slide, label, value, x, y, w, required = false) {
  text(slide, label + (required ? " *" : ""), x, y, w, 0.2, {
    fontSize: 7.6, color: required ? C.red : C.slate, bold: required
  });
  rect(slide, x, y + 0.24, w, 0.36, C.white, "C9D0DA", 0.06);
  text(slide, value, x + 0.1, y + 0.3, w - 0.2, 0.22, {
    fontSize: 7.8, color: value ? C.ink : "9AA4B2"
  });
}

function button(slide, label, x, y, w, kind = "secondary") {
  const fill = kind === "primary" ? C.blue : kind === "danger" ? C.redLight : C.white;
  const color = kind === "primary" ? C.white : kind === "danger" ? C.red : C.navy;
  const border = kind === "primary" ? C.blue : kind === "danger" ? "E5AAA5" : "BFC7D3";
  rect(slide, x, y, w, 0.36, fill, border, 0.06);
  text(slide, label, x, y + 0.06, w, 0.22, { fontSize: 7.8, color, bold: true, align: "center" });
}

function cover(data) {
  const slide = pptx.addSlide();
  slide.background = { color: C.soft };
  rect(slide, 0, 0, 4.7, 7.5, C.navy);
  rect(slide, 4.7, 0, 0.14, 7.5, C.orange);
  text(slide, data.label, 0.62, 0.65, 2.8, 0.28, {
    fontSize: 10, color: "BFD1E8", bold: true
  });
  text(slide, data.title, 0.62, 2.25, 3.45, 1.2, {
    fontSize: 32, color: C.white, bold: true, valign: "top"
  });
  text(slide, data.subtitle, 0.64, 3.55, 3.45, 0.44, {
    fontSize: 14, color: "D6E2F2"
  });
  text(slide, "교육용 가상 제품 · 실제 업무 내용 미사용", 0.64, 6.6, 3.45, 0.28, {
    fontSize: 8.5, color: "AFC2DB"
  });

  rect(slide, 5.45, 0.72, 7.18, 5.95, C.white, C.line, 0.12);
  rect(slide, 5.45, 0.72, 7.18, 0.48, C.navy2, C.navy2, 0.12);
  text(slide, "RoomFlow", 5.72, 0.84, 1.15, 0.2, { fontSize: 9.5, color: C.white, bold: true });
  text(slide, "회의실 예약", 6.05, 1.52, 2.4, 0.42, { fontSize: 20, color: C.navy, bold: true });
  text(slide, "필요한 공간을 찾고, 요청하고, 승인받는 하나의 흐름", 6.05, 1.98, 4.65, 0.3, { fontSize: 10, color: C.slate });
  field(slide, "예약일", "2026-09-03", 6.05, 2.62, 1.5, true);
  field(slide, "시작", "14:00", 7.78, 2.62, 1.05, true);
  field(slide, "종료", "15:00", 9.05, 2.62, 1.05, true);
  field(slide, "인원", "6", 10.32, 2.62, 0.8, true);
  button(slide, "빈 회의실 찾기", 11.35, 2.86, 0.95, "primary");
  [
    ["A-1201", "12명", "화상회의", "예약 가능"],
    ["B-0804", "8명", "화이트보드", "예약 가능"],
    ["C-0502", "6명", "모니터", "승인 필요"]
  ].forEach((row, index) => {
    const y = 3.55 + index * 0.78;
    rect(slide, 6.05, y, 5.95, 0.58, index === 0 ? C.blueLight : C.white, index === 0 ? "BFD1F5" : C.line, 0.06);
    text(slide, row[0], 6.25, y + 0.1, 1.0, 0.22, { fontSize: 9, bold: true, color: C.navy });
    text(slide, row[1], 7.5, y + 0.1, 0.6, 0.22, { fontSize: 8, color: C.slate });
    text(slide, row[2], 8.35, y + 0.1, 1.4, 0.22, { fontSize: 8, color: C.slate });
    text(slide, row[3], 10.2, y + 0.1, 1.45, 0.22, { fontSize: 8, color: index === 2 ? C.orange : C.green, bold: true, align: "right" });
  });
  slide.addNotes(data.notes);
}

function mapSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  text(slide, "화면 목록", 0.48, 0.88, 1.2, 0.28, { fontSize: 11, color: C.navy, bold: true });
  const headers = ["화면 ID", "화면명", "사용자", "Route"];
  const widths = [1.55, 1.8, 1.4, 2.45];
  let x = 0.48;
  headers.forEach((header, index) => {
    rect(slide, x, 1.24, widths[index], 0.44, C.navy2, C.navy2);
    text(slide, header, x + 0.08, 1.31, widths[index] - 0.16, 0.24, { fontSize: 8.5, color: C.white, bold: true, align: "center" });
    x += widths[index];
  });
  data.screens.forEach((screen, rowIndex) => {
    x = 0.48;
    [screen.id, screen.name, screen.role, screen.route].forEach((value, colIndex) => {
      rect(slide, x, 1.68 + rowIndex * 0.58, widths[colIndex], 0.58, rowIndex % 2 ? C.soft : C.white, C.line);
      text(slide, value, x + 0.1, 1.8 + rowIndex * 0.58, widths[colIndex] - 0.2, 0.26, {
        fontSize: 8.7, bold: colIndex < 2, color: colIndex === 0 ? C.blue : C.ink
      });
      x += widths[colIndex];
    });
  });
  rect(slide, 8.15, 1.05, 4.65, 3.65, C.soft, C.line, 0.08);
  text(slide, "사용자 흐름", 8.48, 1.34, 1.35, 0.28, { fontSize: 11, color: C.navy, bold: true });
  data.flow.forEach((step, index) => {
    const y = 1.92 + index * 0.5;
    callout(slide, index + 1, 8.48, y);
    text(slide, step, 8.9, y + 0.02, 2.75, 0.22, { fontSize: 9.5, bold: index === 2 });
    if (index < data.flow.length - 1) line(slide, 8.62, y + 0.29, 0, 0.2, "A8B3C3", 1);
  });
  rect(slide, 0.48, 4.65, 12.32, 1.67, C.blueLight, "BED1F5", 0.08);
  text(slide, "MVP 경계", 0.8, 4.93, 1.05, 0.25, { fontSize: 10, color: C.blue, bold: true });
  text(slide, "포함", 2.0, 4.92, 0.6, 0.25, { fontSize: 9, color: C.green, bold: true });
  text(slide, "조회 · 단건 예약 · 승인/반려 · 취소 · 처리 이력", 2.55, 4.9, 4.55, 0.28, { fontSize: 10, bold: true });
  text(slide, "제외", 7.4, 4.92, 0.6, 0.25, { fontSize: 9, color: C.red, bold: true });
  text(slide, "반복 예약 · 출입 QR · 외부 캘린더 연동", 7.95, 4.9, 4.25, 0.28, { fontSize: 10, bold: true });
  text(slide, "화면 ID는 PPT와 Excel을 연결하는 가장 안정적인 키다.", 0.8, 5.55, 11.4, 0.28, { fontSize: 10, color: C.slate });
  slide.addNotes(data.notes);
}

function listSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  metaStrip(slide, data);
  const a = appFrame(slide, "예약 조회");
  rect(slide, a.x, a.y, a.w, 0.82, C.soft, "E0E5EC", 0.06);
  field(slide, "기간", "2026-09-01  ~  2026-09-07", a.x + 0.18, a.y + 0.12, 2.15);
  field(slide, "건물", "전체", a.x + 2.55, a.y + 0.12, 1.05);
  field(slide, "상태", "전체", a.x + 3.8, a.y + 0.12, 1.05);
  button(slide, "조회", a.x + 5.15, a.y + 0.36, 0.72, "primary");
  button(slide, "초기화", a.x + 5.95, a.y + 0.36, 0.72);
  callout(slide, 1, a.x + 0.02, a.y - 0.05);
  callout(slide, 2, a.x + 4.7, a.y - 0.05);
  text(slide, "예약 4건", a.x + 0.05, a.y + 1.05, 1.0, 0.22, { fontSize: 8.5, color: C.slate, bold: true });
  button(slide, "+ 예약 등록", a.x + 5.73, a.y + 0.94, 0.95, "primary");
  callout(slide, 3, a.x + 6.55, a.y + 0.82);
  const cols = [0.85, 1.3, 1.35, 1.15, 1.35, 0.78];
  const headers = ["상태", "예약일", "시간", "회의실", "예약 제목", "인원"];
  let x = a.x;
  headers.forEach((h, i) => {
    rect(slide, x, a.y + 1.35, cols[i], 0.36, C.navy2, C.navy2);
    text(slide, h, x, a.y + 1.42, cols[i], 0.2, { fontSize: 7.3, color: C.white, bold: true, align: "center" });
    x += cols[i];
  });
  const rows = [
    ["APPROVED", "09-03", "14:00-15:00", "A-1201", "주간 운영회의", "6"],
    ["REQUESTED", "09-03", "16:00-17:00", "B-0804", "내 예약", "5"],
    ["APPROVED", "09-04", "10:00-11:00", "C-0502", "비공개 예약", "4"],
    ["CANCELED", "09-05", "13:00-14:30", "A-1201", "내 예약", "8"]
  ];
  rows.forEach((row, ri) => {
    x = a.x;
    row.forEach((value, ci) => {
      rect(slide, x, a.y + 1.71 + ri * 0.42, cols[ci], 0.42, ri % 2 ? C.soft : C.white, C.line);
      text(slide, value, x + 0.05, a.y + 1.79 + ri * 0.42, cols[ci] - 0.1, 0.22, {
        fontSize: 7.1,
        color: ci === 0 ? (value === "APPROVED" ? C.green : value === "CANCELED" ? C.slate : C.orange) : C.ink,
        bold: ci === 0,
        align: ci === 0 || ci === 5 ? "center" : "left"
      });
      x += cols[ci];
    });
  });
  callout(slide, 4, a.x + 4.15, a.y + 1.73);
  rect(slide, a.x + 1.55, a.y + 3.68, 3.7, 0.42, C.tealLight, "A8DAD9", 0.05);
  text(slide, "결과를 빠르게 표시하고 타인 예약 제목은 숨깁니다.", a.x + 1.7, a.y + 3.76, 3.4, 0.22, { fontSize: 8, color: C.teal, bold: true, align: "center" });
  callout(slide, 5, a.x + 5.15, a.y + 3.73);
  rulePanel(slide, data.rules);
  slide.addNotes(data.notes);
}

function formSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  metaStrip(slide, data);
  const a = appFrame(slide, "예약 등록");
  field(slide, "회의실", "A-1201 · 12명 · 화상회의", a.x, a.y, 3.1, true);
  field(slide, "예약일", "2026-09-03", a.x + 3.35, a.y, 1.45, true);
  callout(slide, 1, a.x + 6.2, a.y - 0.06);
  field(slide, "시작", "14:00", a.x, a.y + 0.85, 1.3, true);
  field(slide, "종료", "15:00", a.x + 1.55, a.y + 0.85, 1.3, true);
  field(slide, "참석 인원", "6", a.x + 3.1, a.y + 0.85, 1.15, true);
  callout(slide, 2, a.x + 4.35, a.y + 0.8);
  field(slide, "예약 제목", "주간 운영회의", a.x, a.y + 1.7, 3.1, true);
  field(slide, "예약 목적", "운영 이슈 공유", a.x + 3.35, a.y + 1.7, 2.35, true);
  callout(slide, 3, a.x + 5.75, a.y + 1.65);
  text(slide, "필요 장비", a.x, a.y + 2.65, 0.85, 0.2, { fontSize: 7.6, color: C.slate });
  ["화상회의", "화이트보드", "추가 모니터"].forEach((label, index) => {
    rect(slide, a.x + index * 1.55, a.y + 2.94, 0.18, 0.18, index < 2 ? C.blue : C.white, index < 2 ? C.blue : "BFC7D3", 0.03);
    if (index < 2) text(slide, "✓", a.x + index * 1.55, a.y + 2.92, 0.18, 0.18, { fontSize: 7, color: C.white, bold: true, align: "center" });
    text(slide, label, a.x + 0.25 + index * 1.55, a.y + 2.91, 1.15, 0.2, { fontSize: 7.4 });
  });
  callout(slide, 4, a.x + 5.62, a.y + 2.88);
  rect(slide, a.x, a.y + 3.42, 5.7, 0.48, C.redLight, "E6BAB6", 0.05);
  text(slide, "같은 회의실과 시간이 겹치면 입력값을 유지한 채 저장을 중단합니다.", a.x + 0.2, a.y + 3.52, 5.3, 0.23, { fontSize: 8.2, color: C.red, bold: true });
  callout(slide, 5, a.x + 5.73, a.y + 3.48);
  button(slide, "취소", a.x + 4.2, a.y + 4.15, 0.7);
  button(slide, "임시저장", a.x + 4.98, a.y + 4.15, 0.82);
  button(slide, "예약 요청", a.x + 5.9, a.y + 4.15, 0.82, "primary");
  rulePanel(slide, data.rules);
  slide.addNotes(data.notes);
}

function detailSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  metaStrip(slide, data);
  const a = appFrame(slide, "내 예약");
  rect(slide, a.x, a.y, 6.7, 0.72, C.blueLight, "BED1F5", 0.06);
  text(slide, "APPROVED", a.x + 0.2, a.y + 0.12, 1.15, 0.22, { fontSize: 9, color: C.green, bold: true });
  text(slide, "주간 운영회의", a.x + 1.45, a.y + 0.09, 2.5, 0.28, { fontSize: 12, color: C.navy, bold: true });
  text(slide, "RF-20260903-014", a.x + 4.85, a.y + 0.12, 1.55, 0.22, { fontSize: 7.5, color: C.slate, align: "right" });
  callout(slide, 1, a.x + 6.37, a.y + 0.06);
  const labels = [
    ["회의실", "A-1201"], ["예약일", "2026-09-03"], ["시간", "14:00-15:00"],
    ["참석 인원", "6명"], ["신청자", "김사용자"], ["처리자", "이승인"]
  ];
  labels.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = a.x + col * 3.35;
    const y = a.y + 1.0 + row * 0.56;
    text(slide, item[0], x, y, 0.8, 0.2, { fontSize: 7.5, color: C.slate, bold: true });
    text(slide, item[1], x + 0.92, y, 2.05, 0.2, { fontSize: 8.2, bold: true });
  });
  rect(slide, a.x, a.y + 2.85, 6.7, 0.95, C.soft, C.line, 0.05);
  text(slide, "처리 이력", a.x + 0.18, a.y + 2.96, 0.9, 0.2, { fontSize: 8.5, color: C.navy, bold: true });
  ["REQUESTED · 09-01 09:12 · 김사용자", "APPROVED · 09-01 10:03 · 이승인"].forEach((value, index) => {
    callout(slide, index + 2, a.x + 1.2, a.y + 2.94 + index * 0.35);
    text(slide, value, a.x + 1.58, a.y + 2.96 + index * 0.35, 3.65, 0.2, { fontSize: 7.5 });
  });
  button(slide, "예약 취소", a.x + 5.55, a.y + 4.18, 1.1, "danger");
  callout(slide, 4, a.x + 6.5, a.y + 4.12);
  rect(slide, a.x + 2.05, a.y + 1.23, 3.55, 2.05, C.white, "AAB4C2", 0.08);
  text(slide, "예약을 취소하시겠습니까?", a.x + 2.35, a.y + 1.48, 2.95, 0.3, { fontSize: 11, color: C.navy, bold: true, align: "center" });
  text(slide, "주간 운영회의\n2026-09-03 · 14:00-15:00", a.x + 2.45, a.y + 1.9, 2.75, 0.52, { fontSize: 8.2, color: C.slate, align: "center" });
  button(slide, "아니오", a.x + 3.15, a.y + 2.63, 0.75);
  button(slide, "예, 취소", a.x + 4.0, a.y + 2.63, 0.85, "danger");
  callout(slide, 5, a.x + 5.33, a.y + 1.17);
  rulePanel(slide, data.rules);
  slide.addNotes(data.notes);
}

function approvalSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  metaStrip(slide, data);
  const a = appFrame(slide, "승인함");
  rect(slide, a.x, a.y, 2.7, 4.25, C.soft, C.line, 0.06);
  text(slide, "대기 중 3건", a.x + 0.2, a.y + 0.16, 1.1, 0.22, { fontSize: 8.5, color: C.navy, bold: true });
  [
    ["REQUESTED", "프로젝트 킥오프", "09-04 10:00"],
    ["REQUESTED", "디자인 리뷰", "09-04 14:00"],
    ["REQUESTED", "운영 점검", "09-05 09:00"]
  ].forEach((row, index) => {
    const y = a.y + 0.58 + index * 0.82;
    rect(slide, a.x + 0.14, y, 2.42, 0.66, index === 0 ? C.blueLight : C.white, index === 0 ? "BED1F5" : C.line, 0.05);
    text(slide, row[0], a.x + 0.28, y + 0.08, 0.85, 0.18, { fontSize: 6.8, color: C.orange, bold: true });
    text(slide, row[1], a.x + 0.28, y + 0.29, 1.45, 0.2, { fontSize: 8.1, bold: true });
    text(slide, row[2], a.x + 1.57, y + 0.29, 0.78, 0.2, { fontSize: 6.8, color: C.slate, align: "right" });
  });
  callout(slide, 1, a.x + 2.48, a.y + 0.48);
  rect(slide, a.x + 2.95, a.y, 3.75, 4.25, C.white, C.line, 0.06);
  text(slide, "프로젝트 킥오프", a.x + 3.2, a.y + 0.18, 2.3, 0.28, { fontSize: 12, color: C.navy, bold: true });
  text(slide, "A-1201 · 09-04 10:00-11:30 · 12명", a.x + 3.2, a.y + 0.56, 2.85, 0.22, { fontSize: 7.6, color: C.slate });
  text(slide, "신청자", a.x + 3.2, a.y + 1.03, 0.7, 0.2, { fontSize: 7.3, color: C.slate, bold: true });
  text(slide, "박신청", a.x + 4.0, a.y + 1.03, 1.1, 0.2, { fontSize: 8.1, bold: true });
  text(slide, "예약 목적", a.x + 3.2, a.y + 1.42, 0.7, 0.2, { fontSize: 7.3, color: C.slate, bold: true });
  text(slide, "프로젝트 착수 범위 합의", a.x + 4.0, a.y + 1.42, 1.95, 0.2, { fontSize: 8.1 });
  rect(slide, a.x + 3.2, a.y + 2.05, 3.1, 0.68, C.yellowLight, "E9D083", 0.04);
  text(slide, "반려 사유를 입력하지 않으면\n반려 버튼을 실행할 수 없습니다.", a.x + 3.43, a.y + 2.18, 2.65, 0.38, { fontSize: 8.1, color: "8B6900", bold: true, align: "center" });
  callout(slide, 2, a.x + 6.12, a.y + 2.0);
  field(slide, "반려 사유", "", a.x + 3.2, a.y + 2.95, 3.1, true);
  callout(slide, 3, a.x + 6.12, a.y + 2.9);
  button(slide, "반려", a.x + 4.55, a.y + 3.72, 0.8, "danger");
  button(slide, "승인", a.x + 5.48, a.y + 3.72, 0.82, "primary");
  callout(slide, 4, a.x + 6.22, a.y + 3.66);
  rect(slide, a.x + 0.25, a.y + 4.48, 6.2, 0.42, C.tealLight, "AFDCD9", 0.04);
  text(slide, "처리 완료된 요청은 목록에서 사라지며 동일 요청을 다시 처리할 수 없습니다.", a.x + 0.48, a.y + 4.57, 5.75, 0.22, { fontSize: 8, color: C.teal, bold: true, align: "center" });
  callout(slide, 5, a.x + 6.32, a.y + 4.53);
  rulePanel(slide, data.rules);
  slide.addNotes(data.notes);
}

function statesSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  text(slide, "정상 화면만으로는 구현 계약이 완성되지 않는다.", 0.48, 0.9, 7.4, 0.3, { fontSize: 12, color: C.slate });
  data.states.forEach((state, index) => {
    const x = 0.48 + (index % 2) * 6.15;
    const y = 1.45 + Math.floor(index / 2) * 2.45;
    rect(slide, x, y, 5.82, 2.05, C.white, C.line, 0.08);
    rect(slide, x, y, 1.18, 2.05, index === 3 ? C.redLight : index === 2 ? C.yellowLight : C.blueLight, C.line, 0.08);
    const icon = index === 0 ? "•••" : index === 1 ? "0" : index === 2 ? "!" : "×";
    text(slide, icon, x + 0.18, y + 0.52, 0.82, 0.62, {
      fontSize: index === 0 ? 24 : 32,
      color: index === 3 ? C.red : index === 2 ? C.yellow : C.blue,
      bold: true,
      align: "center"
    });
    text(slide, state.name, x + 1.48, y + 0.35, 1.25, 0.28, { fontSize: 12, color: C.navy, bold: true });
    text(slide, state.message, x + 1.48, y + 0.82, 3.85, 0.3, { fontSize: 10, bold: true });
    rect(slide, x + 1.48, y + 1.36, 3.68, 0.35, C.soft, "E1E5EB", 0.04);
    text(slide, state.rule, x + 1.65, y + 1.42, 3.35, 0.2, { fontSize: 8.3, color: C.slate });
  });
  rect(slide, 0.48, 6.45, 12.15, 0.45, C.navy, C.navy, 0.05);
  text(slide, "오류 시 폼 입력값은 유지한다 · 메시지 코드는 Excel에서 대조한다", 0.75, 6.53, 11.6, 0.24, { fontSize: 10, color: C.white, bold: true, align: "center" });
  slide.addNotes(data.notes);
}

function reviewSlide(data, page) {
  const slide = pptx.addSlide();
  documentHeader(slide, data.title, page);
  text(slide, "아래 항목은 구현 요구사항이 아니라 결정이 필요한 증거다.", 0.48, 0.9, 8.5, 0.3, { fontSize: 12, color: C.slate });
  const widths = [1.45, 2.35, 8.15];
  let x = 0.48;
  ["분류", "주제", "원본에서 확인할 내용"].forEach((h, i) => {
    rect(slide, x, 1.38, widths[i], 0.5, C.navy2, C.navy2);
    text(slide, h, x, 1.49, widths[i], 0.24, { fontSize: 9, color: C.white, bold: true, align: "center" });
    x += widths[i];
  });
  data.items.forEach((item, rowIndex) => {
    const y = 1.88 + rowIndex * 0.86;
    const tagFill = item.tag === "CONFLICT" ? C.orangeLight : item.tag === "AMBIGUOUS" ? C.yellowLight : C.soft;
    const tagColor = item.tag === "CONFLICT" ? C.orange : item.tag === "AMBIGUOUS" ? "967100" : C.slate;
    x = 0.48;
    [item.tag, item.topic, item.detail].forEach((value, colIndex) => {
      rect(slide, x, y, widths[colIndex], 0.86, colIndex === 0 ? tagFill : rowIndex % 2 ? C.soft : C.white, C.line);
      text(slide, value, x + 0.14, y + 0.18, widths[colIndex] - 0.28, 0.48, {
        fontSize: colIndex === 2 ? 10 : 9,
        color: colIndex === 0 ? tagColor : C.ink,
        bold: colIndex < 2,
        align: colIndex === 0 ? "center" : "left"
      });
      x += widths[colIndex];
    });
  });
  text(slide, "원본 간 충돌을 조용히 해결하지 말고 OPEN 질문으로 남긴다.", 0.48, 6.45, 12.15, 0.34, { fontSize: 12, color: C.orange, bold: true, align: "center" });
  slide.addNotes(data.notes);
}

outline.slides.forEach((data, index) => {
  const page = index + 1;
  if (data.type === "cover") cover(data);
  else if (data.type === "map") mapSlide(data, page);
  else if (data.type === "screen-list") listSlide(data, page);
  else if (data.type === "screen-form") formSlide(data, page);
  else if (data.type === "screen-detail") detailSlide(data, page);
  else if (data.type === "screen-approval") approvalSlide(data, page);
  else if (data.type === "states") statesSlide(data, page);
  else if (data.type === "review") reviewSlide(data, page);
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
pptx.writeFile({ fileName: outputPath });
console.log("created: " + outputPath);
