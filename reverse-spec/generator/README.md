# 예시 Office 파일 재생성

`input_ppt_outline.json`과 두 생성기가 실습 입력 파일의 원천입니다. 입력 PPTX와 XLSX는 이미 커밋되어 있으므로 일반 실습에서는 재생성할 필요가 없습니다.

```bash
node reverse-spec/generator/build_input_ppt.js
node reverse-spec/generator/build_input_workbook.mjs
```

Excel 생성기는 Codex의 `@oai/artifact-tool` 런타임을 사용합니다. Claude Code에서는 커밋된 XLSX를 그대로 읽고, 수정이 필요하면 공식 `xlsx` Skill을 사용합니다.

결과:

```text
reverse-spec/input/roomflow_screen_definition.pptx
reverse-spec/input/roomflow_function_definition.xlsx
```

교육용 충돌을 유지합니다.

- 기본 조회 기간: PPT 7일, Excel 30일
- 취소 가능 시점: PPT 시작 2시간 전 제안, Excel 시작 4시간 전 검토중
- 예약 목적: PPT 필수, Excel 선택 항목으로 검토중
- 조회 응답: 측정값 없이 “빠르게”
- 취소 알림 채널과 관리자 대리 승인: 미정
- 반복 예약·출입 QR: 범위 밖
