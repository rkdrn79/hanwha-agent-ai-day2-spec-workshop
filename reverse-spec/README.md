# Office → SPEC 예제 입력

`RoomFlow`는 UI 화면설계서와 기능정의서에서 구현 가능한 요구사항을 복원하는 예제 서비스입니다.

범용 Skill에는 RoomFlow나 파일 수를 고정하지 않습니다. 이 예제의 조건은 [`BRIEF.md`](BRIEF.md)에 있습니다.

## 입력

- [`roomflow_screen_definition.pptx`](input/roomflow_screen_definition.pptx): 화면 흐름, UI 와이어프레임, 번호별 동작·검증
- [`roomflow_function_definition.xlsx`](input/roomflow_function_definition.xlsx): 화면 항목, 버튼 이벤트, 상태 전이, 메시지·권한

![PowerPoint 8장 미리보기](previews/roomflow_ppt_contact.jpg)

![Excel 요약 시트](previews/roomflow_요약.png)

두 입력은 일부러 완전히 일치하지 않습니다.

- 같은 기능에 서로 다른 값이 적힌 항목
- 측정 기준이 없는 표현
- 아직 검토 중인 아이디어
- 명시적으로 범위 밖인 기능

이 차이를 임의로 해결하지 않고 증거 분류와 `OPEN_QUESTIONS.md`로 보존하는 것이 핵심입니다.

추출기는 PPT 전체 장을 한 행으로 합치지 않고 주장·표 행·발표자 노트를 각각의 locator로 나눕니다.
Excel에서는 행뿐 아니라 수식과 데이터 검증 흔적도 함께 기록합니다.

## 사용 Skill

- `office-to-spec`: 증거 분류, 질문 분리, SPEC 구조, 추적성 검증
- `pptx`: 슬라이드 본문·번호 설명·발표자 노트 확인
- `xlsx`: 시트·셀·수식·데이터 검증 확인

## 결과

```text
reverse-spec/output/
├─ 01_source_inventory.md
├─ 02_evidence_ledger.csv
├─ SPEC.md
├─ TRACEABILITY.csv
├─ OPEN_QUESTIONS.md
└─ QA_REPORT.md
```

실행 프롬프트는 루트 [`README.md`](../README.md)의 `4. Office → SPEC`을 사용합니다.

다른 프로젝트에서는 `office-to-spec`과 필요한 파일 Skill을 그대로 복사하고
`BRIEF.md`의 입력 파일·문서 프로필·연결 키·출력 경로만 바꿉니다. PPT만 또는 Excel만 있는 작업도 가능합니다.

검증 명령:

```bash
python .claude/skills/office-to-spec/scripts/validate_spec.py \
  --spec reverse-spec/output/SPEC.md \
  --traceability reverse-spec/output/TRACEABILITY.csv \
  --questions reverse-spec/output/OPEN_QUESTIONS.md \
  --evidence reverse-spec/output/02_evidence_ledger.csv
```
