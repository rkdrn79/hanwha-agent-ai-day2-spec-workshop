#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');

function configureNodePath() {
  const candidates = [
    process.env.PPTX_NODE_MODULES,
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '..', '..', 'node_modules'),
  ].filter(Boolean);
  const existing = String(process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && !existing.includes(candidate)) existing.push(candidate);
  }
  process.env.NODE_PATH = existing.join(path.delimiter);
  Module._initPaths();
}

configureNodePath();

let PptxGenJS;
try {
  PptxGenJS = require('pptxgenjs');
} catch (error) {
  console.error('PptxGenJS를 찾을 수 없습니다. presentation/generator에서 npm install을 실행하거나 PPTX_NODE_MODULES를 지정하세요.');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..', '..');
const OUTLINE_PATH = path.join(ROOT, 'presentation', 'outline.json');
const OUTPUT_PATH = path.join(ROOT, 'presentation', 'output', 'ips_wbs_solution_brief.pptx');
const outline = JSON.parse(fs.readFileSync(OUTLINE_PATH, 'utf8'));

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'HANWHA_16X9', width: 10, height: 5.625 });
pptx.layout = 'HANWHA_16X9';
pptx.author = 'Agent AI for Work';
pptx.company = 'Hanwha Agent AI Workshop';
pptx.subject = 'IPS WBS 출고·취소 MVP solution brief';
pptx.title = outline.title;
pptx.lang = 'ko-KR';
const PRESENTATION_FONT = process.env.PPT_FONT || 'Arial Unicode MS';

pptx.theme = {
  headFontFace: PRESENTATION_FONT,
  bodyFontFace: PRESENTATION_FONT,
  lang: 'ko-KR',
};

const W = 10;
const H = 5.625;
const FONT = PRESENTATION_FONT;
const MONO = 'Aptos Mono';
const C = {
  orange: 'F37321',
  orangeDark: 'D95514',
  peach: 'F7C38E',
  peachLight: 'FFF2E6',
  navy: '123C88',
  blue: '2C63E7',
  paleBlue: 'EFF4FF',
  ink: '1F2937',
  slate: '657084',
  line: 'D8DEE8',
  soft: 'F7F8FA',
  green: '13866B',
  greenLight: 'E8F7F2',
  red: 'DC3A32',
  redLight: 'FDEDEC',
  white: 'FFFFFF',
};

const S = pptx.ShapeType;

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || FONT,
    fontSize: opts.fontSize || 16,
    color: opts.color || C.ink,
    bold: Boolean(opts.bold),
    align: opts.align || 'left',
    valign: opts.valign || 'mid',
    margin: opts.margin === undefined ? 0 : opts.margin,
    breakLine: false,
    fit: 'shrink',
    ...opts,
  });
}

function addRect(slide, x, y, w, h, fill, line = fill, radius = 0) {
  slide.addShape(radius ? S.roundRect : S.rect, {
    x, y, w, h,
    rectRadius: radius,
    fill: { color: fill },
    line: { color: line, width: line === fill ? 0.6 : 1.2 },
  });
}

function addLine(slide, x, y, w, h, color = C.line, width = 1.2, dash = 'solid', endArrowType) {
  slide.addShape(S.line, {
    x, y, w, h,
    line: {
      color,
      width,
      dash,
      ...(endArrowType ? { endArrowType } : {}),
    },
  });
}

function addPill(slide, text, x, y, w, h, fill, color, fontSize = 11) {
  addRect(slide, x, y, w, h, fill, fill, 0.18);
  addText(slide, text, x + 0.06, y, w - 0.12, h, {
    fontSize, color, bold: true, align: 'center',
  });
}

function addHeader(slide, section, title) {
  addRect(slide, 0, 0, W, 0.62, C.orange);
  addText(slide, section, 0.48, 0.08, 1.35, 0.42, {
    fontSize: 12, color: C.white, bold: true,
  });
  addText(slide, title, 1.92, 0.07, 7.58, 0.44, {
    fontSize: 20, color: C.white, bold: true,
  });
}

function addFooter(slide, source, page) {
  addLine(slide, 0.45, 5.12, 9.1, 0, C.line, 0.7);
  addText(slide, source, 0.48, 5.18, 5.55, 0.24, {
    fontSize: 8.5, color: C.slate,
  });
  addText(slide, 'Agent AI for Work · Solution → PPT', 6.25, 5.18, 2.85, 0.24, {
    fontSize: 8.5, color: C.navy, align: 'right',
  });
  addText(slide, String(page), 9.25, 5.18, 0.28, 0.24, {
    fontSize: 9, color: C.navy, bold: true, align: 'right',
  });
}

function addNotes(slide, data) {
  slide.addNotes(`${data.notes}\n\n근거: ${data.source}`);
}

function coverSlide(data) {
  const slide = pptx.addSlide();
  slide.background = { color: C.orange };

  addRect(slide, 8.3, 0, 1.7, H, C.peach);
  slide.addShape(S.chevron, {
    x: 6.45, y: 3.75, w: 2.75, h: 1.7,
    rotate: 90,
    fill: { color: C.peach }, line: { color: C.peach },
  });
  slide.addShape(S.chevron, {
    x: 7.75, y: 0.22, w: 1.55, h: 1.35,
    rotate: 90,
    fill: { color: C.orange }, line: { color: C.orange },
  });

  addPill(slide, 'AUG. 2026', 0.5, 0.22, 1.72, 0.48, C.peach, '6E3B14', 13);
  addText(slide, 'AGENT AI', 2.48, 0.26, 1.15, 0.36, {
    fontSize: 12.5, color: C.white, bold: true,
  });
  addText(slide, 'SOLUTION BRIEF', 0.52, 1.35, 2.1, 0.3, {
    fontSize: 12, color: C.peachLight, bold: true,
  });
  addText(slide, data.title, 0.5, 1.68, 7.05, 0.82, {
    fontSize: 31, color: C.white, bold: true,
  });
  addText(slide, data.subtitle, 0.52, 2.54, 6.8, 0.42, {
    fontSize: 15.5, color: C.white,
  });

  const xs = [0.55, 2.7, 4.85];
  data.flow.forEach((value, i) => {
    addText(slide, value, xs[i], 3.42, 1.35, 0.66, {
      fontSize: 34, color: C.white, bold: true, align: 'center',
    });
    addText(slide, data.flow_labels[i], xs[i], 4.06, 1.35, 0.3, {
      fontSize: 10.5, color: C.peachLight, align: 'center',
    });
    if (i < 2) {
      addLine(slide, xs[i] + 1.45, 3.76, 0.65, 0, C.peach, 3, 'solid', 'triangle');
    }
  });
  addText(slide, data.source, 0.54, 5.05, 4.2, 0.24, {
    fontSize: 9, color: C.peachLight,
  });
  addText(slide, 'Agent AI for Work', 7.12, 5.05, 1.12, 0.24, {
    fontSize: 9, color: C.white, align: 'right',
  });
  addText(slide, '1', 9.28, 5.05, 0.24, 0.24, {
    fontSize: 9, color: C.orangeDark, bold: true, align: 'right',
  });
  addNotes(slide, data);
}

function problemSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  addText(slide, data.left_title, 0.6, 0.93, 3.8, 0.36, {
    fontSize: 18, color: C.red, bold: true,
  });
  addText(slide, data.right_title, 5.2, 0.93, 4.1, 0.36, {
    fontSize: 18, color: C.navy, bold: true,
  });
  addLine(slide, 4.82, 0.95, 0, 3.42, C.line, 1, 'dash');

  const leftY = [1.55, 2.25, 2.95];
  data.left_steps.forEach((step, i) => {
    addRect(slide, 0.72, leftY[i], 1.72, 0.48, C.soft, C.line, 0.1);
    addText(slide, step, 0.82, leftY[i], 1.52, 0.48, {
      fontSize: 13, color: C.ink, bold: true, align: 'center',
    });
    if (i < 2) addLine(slide, 1.58, leftY[i] + 0.5, 0, 0.18, C.red, 1.8, 'solid', 'triangle');
  });
  data.left_risks.forEach((risk, i) => {
    addPill(slide, risk, 2.72, 1.83 + i * 0.93, 1.55, 0.48, C.redLight, C.red, 12);
    addLine(slide, 2.45, 2.06 + i * 0.23, 0.25, i ? 0.7 : 0, C.red, 1.5, 'dash', 'triangle');
  });

  const rightX = [5.25, 6.03, 6.81, 7.59, 8.47];
  data.right_steps.forEach((step, i) => {
    const isLast = i === data.right_steps.length - 1;
    addRect(slide, rightX[i], 1.78, 0.68, 0.68, isLast ? C.orange : C.paleBlue, isLast ? C.orange : C.blue, 0.12);
    addText(slide, step, rightX[i] + 0.03, 1.78, 0.62, 0.68, {
      fontSize: 10.8, color: isLast ? C.white : C.navy, bold: true, align: 'center',
    });
    if (!isLast) addLine(slide, rightX[i] + 0.69, 2.12, 0.08, 0, C.blue, 1.4, 'solid', 'triangle');
  });
  addRect(slide, 5.24, 2.83, 3.92, 0.88, C.ink, C.ink, 0.08);
  addText(slide, '검증 순서', 5.52, 2.98, 0.9, 0.28, {
    fontSize: 11, color: C.peach, bold: true,
  });
  addText(slide, 'service.py → store 1회 호출', 6.35, 2.95, 2.45, 0.34, {
    fontSize: 12, color: C.white, fontFace: MONO,
  });
  addText(slide, '실패: stock · shipment · request_id 모두 변경 없음', 5.52, 3.35, 3.25, 0.22, {
    fontSize: 10.2, color: 'D9E4F5',
  });

  addRect(slide, 0.65, 4.32, 8.72, 0.52, C.peachLight, C.orange, 0.08);
  addText(slide, data.takeaway, 0.9, 4.32, 8.2, 0.52, {
    fontSize: 14, color: C.orangeDark, bold: true, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function stateFlowSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  const xs = [0.8, 3.9, 7.0];
  data.inventory.forEach((value, i) => {
    addText(slide, data.actions[i], xs[i], 1.0, 1.55, 0.3, {
      fontSize: 11.5, color: i === 1 ? C.orangeDark : C.slate, bold: i === 1, align: 'center',
    });
    addRect(slide, xs[i], 1.42, 1.55, 1.0, i === 1 ? C.peachLight : C.paleBlue, i === 1 ? C.orange : C.blue, 0.12);
    addText(slide, value, xs[i], 1.45, 1.55, 0.62, {
      fontSize: 34, color: i === 1 ? C.orangeDark : C.navy, bold: true, align: 'center',
    });
    addText(slide, i === 1 ? '잔량' : '재고', xs[i], 2.05, 1.55, 0.2, {
      fontSize: 9.5, color: C.slate, align: 'center',
    });
    if (i < 2) addLine(slide, xs[i] + 1.72, 1.92, 1.12, 0, C.orange, 2.8, 'solid', 'triangle');
  });

  addText(slide, '출고 상태', 0.78, 3.0, 1.2, 0.26, {
    fontSize: 11, color: C.slate, bold: true,
  });
  addRect(slide, 2.05, 2.86, 2.42, 0.62, C.navy, C.navy, 0.12);
  addText(slide, data.statuses[0], 2.05, 2.86, 2.42, 0.62, {
    fontSize: 17, color: C.white, bold: true, align: 'center',
  });
  addLine(slide, 4.72, 3.17, 1.2, 0, C.orange, 2.5, 'solid', 'triangle');
  addRect(slide, 6.18, 2.86, 2.42, 0.62, C.green, C.green, 0.12);
  addText(slide, data.statuses[1], 6.18, 2.86, 2.42, 0.62, {
    fontSize: 17, color: C.white, bold: true, align: 'center',
  });

  addLine(slide, 3.25, 3.53, 0, 0.4, C.red, 1.5, 'dash', 'triangle');
  addRect(slide, 2.1, 4.0, 6.5, 0.58, C.redLight, C.red, 0.08);
  addText(slide, data.failure, 2.32, 4.0, 6.08, 0.58, {
    fontSize: 14, color: C.red, bold: true, align: 'center',
  });
  addText(slide, 'PENDING 없음  ·  부분 취소 없음  ·  CANCELED는 종결', 2.3, 4.62, 6.1, 0.23, {
    fontSize: 10.5, color: C.slate, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function invariantsSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  const rows = [
    data.headers.map((text) => ({ text, options: { bold: true, color: C.white, fill: C.navy, align: 'center', valign: 'mid' } })),
    ...data.rows.map((row, rowIndex) => row.map((text, colIndex) => ({
      text,
      options: {
        color: colIndex === 2 ? C.green : C.ink,
        bold: colIndex === 0 || colIndex === 2,
        fill: rowIndex % 2 ? C.soft : C.white,
        align: colIndex === 1 ? 'left' : 'center',
        valign: 'mid',
      },
    }))),
  ];
  slide.addTable(rows, {
    x: 0.65, y: 1.12, w: 8.7, h: 2.96,
    colW: [1.55, 2.45, 2.45, 1.2],
    rowH: [0.5, 0.58, 0.58, 0.58, 0.58],
    fontFace: FONT,
    fontSize: 12.5,
    margin: 0.08,
    border: { type: 'solid', color: C.line, pt: 0.8 },
    autoFit: false,
    valign: 'mid',
  });

  addRect(slide, 0.92, 4.37, 8.16, 0.48, C.greenLight, C.green, 0.08);
  addText(slide, data.takeaway, 1.15, 4.37, 7.7, 0.48, {
    fontSize: 13, color: C.green, bold: true, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function movementTypesSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  addText(slide, 'WBS 업무 유형', 0.65, 0.94, 2.0, 0.24, { fontSize: 10.5, color: C.slate, bold: true });
  addText(slide, '판정 규칙', 3.02, 0.94, 1.3, 0.24, { fontSize: 10.5, color: C.slate, bold: true, align: 'center' });
  addText(slide, '출고', 5.75, 0.94, 0.9, 0.24, { fontSize: 10.5, color: C.slate, bold: true, align: 'center' });
  addText(slide, '취소', 8.05, 0.94, 0.9, 0.24, { fontSize: 10.5, color: C.slate, bold: true, align: 'center' });

  data.rows.forEach((row, i) => {
    const y = 1.32 + i * 1.0;
    addRect(slide, 0.64, y, 8.72, 0.72, i === 1 ? C.peachLight : C.soft, i === 1 ? C.orange : C.line, 0.1);
    addText(slide, row.type, 0.88, y, 1.9, 0.72, { fontSize: 15, color: C.ink, bold: true });
    addPill(slide, row.rule, 3.0, y + 0.16, 1.28, 0.4, C.white, C.navy, 11.5);
    addRect(slide, 5.58, y + 0.08, 1.28, 0.56, C.navy, C.navy, 0.1);
    addText(slide, row.ship, 5.58, y + 0.08, 1.28, 0.56, { fontSize: 19, color: C.white, bold: true, align: 'center', fontFace: MONO });
    addLine(slide, 6.98, y + 0.36, 0.86, 0, C.orange, 2.5, 'solid', 'triangle');
    addRect(slide, 7.98, y + 0.08, 1.12, 0.56, C.orange, C.orange, 0.1);
    addText(slide, row.cancel, 7.98, y + 0.08, 1.12, 0.56, { fontSize: 19, color: C.white, bold: true, align: 'center', fontFace: MONO });
  });

  addRect(slide, 1.2, 4.48, 7.6, 0.4, C.paleBlue, C.blue, 0.08);
  addText(slide, data.takeaway, 1.4, 4.48, 7.2, 0.4, {
    fontSize: 12.5, color: C.navy, bold: true, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function architectureSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  const xs = [0.55, 2.92, 5.0, 7.08];
  const widths = [1.92, 1.5, 1.5, 2.35];
  data.layers.forEach((layer, i) => {
    const fill = i === 0 ? C.paleBlue : i === 2 ? C.peachLight : C.soft;
    const border = i === 0 ? C.blue : i === 2 ? C.orange : C.line;
    addPill(slide, layer.owner, xs[i], 1.0, widths[i], 0.34, i === 0 ? C.paleBlue : C.soft, i === 2 ? C.orangeDark : C.navy, 9.3);
    addRect(slide, xs[i], 1.52, widths[i], 1.13, fill, border, 0.1);
    addText(slide, layer.name, xs[i] + 0.1, 1.62, widths[i] - 0.2, 0.35, {
      fontSize: 16.5, color: i === 2 ? C.orangeDark : C.navy, bold: true, align: 'center',
    });
    addText(slide, layer.files, xs[i] + 0.12, 2.03, widths[i] - 0.24, 0.38, {
      fontSize: 9.4, color: C.ink, align: 'center', fontFace: MONO,
    });
    if (i < data.layers.length - 1) addLine(slide, xs[i] + widths[i] + 0.08, 2.08, 0.34, 0, C.orange, 2.1, 'solid', 'triangle');
  });

  addRect(slide, 0.72, 3.05, 8.56, 0.72, C.ink, C.ink, 0.08);
  addText(slide, '검증 순서', 0.98, 3.05, 1.0, 0.72, { fontSize: 11, color: C.peach, bold: true, align: 'center' });
  addText(slide, '입력 → 중복 → 재고 → 상태 → movement type → store 1회', 2.0, 3.05, 6.84, 0.72, {
    fontSize: 14, color: C.white, bold: true, align: 'center', fontFace: MONO,
  });

  const ruleX = [0.94, 3.7, 6.46];
  data.rules.forEach((rule, i) => {
    addLine(slide, ruleX[i], 4.2, 2.05, 0, i === 1 ? C.orange : C.blue, 3.5);
    addText(slide, rule, ruleX[i], 4.28, 2.05, 0.38, {
      fontSize: 12.5, color: C.ink, bold: true, align: 'center',
    });
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function validationSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  addRect(slide, 0.65, 1.05, 3.35, 3.48, C.ink, C.ink, 0.1);
  addText(slide, data.hero, 0.85, 1.48, 2.95, 1.0, {
    fontSize: 46, color: C.white, bold: true, align: 'center',
  });
  addText(slide, 'AUTOMATED TESTS', 1.06, 2.5, 2.55, 0.32, {
    fontSize: 11, color: C.peach, bold: true, align: 'center',
  });
  data.automated.forEach((item, i) => {
    addText(slide, `✓  ${item}`, 1.1, 2.98 + i * 0.33, 2.4, 0.24, {
      fontSize: 11.5, color: C.white,
    });
  });

  addText(slide, '브라우저 스모크', 4.62, 1.12, 3.7, 0.4, {
    fontSize: 18, color: C.navy, bold: true,
  });
  addLine(slide, 4.62, 1.57, 4.45, 0, C.blue, 2.5);
  data.browser.forEach((item, i) => {
    const y = 1.9 + i * 0.62;
    addText(slide, String(i + 1).padStart(2, '0'), 4.68, y, 0.42, 0.3, {
      fontSize: 11, color: C.orange, bold: true,
    });
    addText(slide, item, 5.25, y - 0.03, 3.6, 0.36, {
      fontSize: 15, color: C.ink, bold: i === 0,
    });
    if (i < data.browser.length - 1) addLine(slide, 5.24, y + 0.43, 3.62, 0, C.line, 0.8);
  });
  addRect(slide, 4.58, 4.35, 4.42, 0.48, C.peachLight, C.orange, 0.08);
  addText(slide, data.takeaway, 4.78, 4.35, 4.02, 0.48, {
    fontSize: 11.8, color: C.orangeDark, bold: true, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

function closeSlide(data, page) {
  const slide = pptx.addSlide();
  addHeader(slide, data.section, data.title);

  addText(slide, data.closing, 0.68, 0.95, 5.2, 0.46, {
    fontSize: 21, color: C.ink, bold: true,
  });
  addText(slide, 'Source of truth가 바뀐 뒤 View를 다시 만듭니다.', 0.7, 1.42, 5.5, 0.3, {
    fontSize: 12.5, color: C.slate,
  });

  const xs = [0.58, 2.65, 4.72, 7.12];
  const ws = [1.52, 1.52, 1.52, 2.05];
  data.pipeline.forEach((item, i) => {
    const isLast = i === data.pipeline.length - 1;
    addRect(slide, xs[i], 2.08, ws[i], 0.92, isLast ? C.orange : C.paleBlue, isLast ? C.orange : C.blue, 0.12);
    addText(slide, item, xs[i], 2.08, ws[i], 0.92, {
      fontSize: isLast ? 22 : 17, color: isLast ? C.white : C.navy, bold: true, align: 'center', fontFace: MONO,
    });
    if (!isLast) addLine(slide, xs[i] + ws[i] + 0.12, 2.54, 0.72, 0, C.orange, 2.6, 'solid', 'triangle');
  });

  addText(slide, '현재 범위 밖', 0.7, 3.62, 1.25, 0.28, {
    fontSize: 11, color: C.slate, bold: true,
  });
  addLine(slide, 1.82, 3.77, 7.15, 0, C.line, 0.8);
  data.out_of_scope.forEach((item, i) => {
    addPill(slide, item, 0.75 + i * 2.2, 4.05, 1.82, 0.46, C.soft, C.slate, 11.5);
  });
  addText(slide, '변경 순서  사람 승인 → SPEC 개정 → tests 조정 → PPT 재생성', 1.0, 4.62, 8.0, 0.28, {
    fontSize: 11.5, color: C.navy, bold: true, align: 'center',
  });
  addFooter(slide, data.source, page);
  addNotes(slide, data);
}

const renderers = {
  cover: coverSlide,
  problem: problemSlide,
  state_flow: stateFlowSlide,
  invariants: invariantsSlide,
  movement_types: movementTypesSlide,
  architecture: architectureSlide,
  validation: validationSlide,
  close: closeSlide,
};

function inspectBounds() {
  const issues = [];
  pptx._slides.forEach((slide, slideIndex) => {
    for (const obj of slide._slideObjects || []) {
      const opts = obj.options || {};
      if (![opts.x, opts.y, opts.w, opts.h].every((value) => typeof value === 'number')) continue;
      // PptxGenJS expands table geometry to EMU internally; inspect only
      // authoring-time inch coordinates here and let Office validation inspect tables.
      if ([opts.x, opts.y, opts.w, opts.h].some((value) => value > 100)) continue;
      if (opts.x < -0.01 || opts.y < -0.01 || opts.x + opts.w > W + 0.01 || opts.y + opts.h > H + 0.01) {
        issues.push(`slide ${slideIndex + 1}: object out of bounds (${opts.x}, ${opts.y}, ${opts.w}, ${opts.h})`);
      }
    }
  });
  if (issues.length) throw new Error(`레이아웃 범위 오류:\n${issues.join('\n')}`);
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  outline.slides.forEach((slideData, index) => {
    const renderer = renderers[slideData.kind];
    if (!renderer) throw new Error(`지원하지 않는 slide kind: ${slideData.kind}`);
    renderer(slideData, index + 1);
  });
  inspectBounds();
  await pptx.writeFile({ fileName: OUTPUT_PATH });
  console.log(`PPTX 생성 완료: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
