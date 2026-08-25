---
name: office-to-spec
description: PowerPoint와 Excel에 흩어진 업무 요구사항을 출처 추적 가능한 Markdown SPEC으로 변환한다. 슬라이드·시트의 충돌, 모호함, 누락을 보존하면서 요구사항 ID, 인수 조건, 추적표, 미결정 질문을 만들 때 사용한다.
---

# Office → Spec

PPT와 Excel을 문장으로 요약하는 데서 멈추지 않는다. 원본 위치가 연결된 요구사항, 검증 가능한 인수 조건, 사람이 결정해야 할 질문을 만든다.

## 함께 사용할 Skill

- `.claude/skills/pptx/SKILL.md`: PPT 텍스트·발표자 노트·표·시각 배치 확인
- `.claude/skills/xlsx/SKILL.md`: Excel 값·수식·주석·검증 규칙·시트 구조 확인

두 Skill을 먼저 읽고 파일 형식별 절차를 따른다. 이 작업의 최종 산출물은 `office-to-spec`이 소유하며, `xlsx`는 입력 파일 조사에만 사용한다. 텍스트 추출만으로 의미가 불분명하면 PPT는 슬라이드를 렌더링하고, Excel은 시트의 실제 셀 위치와 수식을 확인한다.

## 입력과 결과

기본 입력:

```text
reverse-spec/input/
├─ roomflow_screen_definition.pptx
└─ roomflow_function_definition.xlsx
```

기본 결과:

```text
reverse-spec/output/
├─ 01_source_inventory.md
├─ 02_evidence_ledger.csv
├─ SPEC.md
├─ TRACEABILITY.csv
├─ OPEN_QUESTIONS.md
└─ QA_REPORT.md
```

## 작업 순서

### 1. 원본을 훼손하지 않고 조사한다

먼저 아래 스크립트로 파일 구조와 원문 위치를 기록한다.

```bash
python .claude/skills/office-to-spec/scripts/extract_office_evidence.py \
  --pptx reverse-spec/input/roomflow_screen_definition.pptx \
  --xlsx reverse-spec/input/roomflow_function_definition.xlsx \
  --output-dir reverse-spec/output
```

그다음 PPT 전체를 렌더링해 텍스트의 강조·흐름·주석을 확인하고, Excel의 모든 시트와 수식·데이터 검증·주석을 확인한다. 표의 빈 셀이나 색상만 보고 요구사항을 추정하지 않는다.

UI 명세는 화면 단위로 연결해 읽는다.

```text
화면 ID
  → 화면 항목과 필수 여부
  → 버튼·이벤트의 실행 조건
  → 성공 상태와 실패 상태
  → 메시지·오류 코드
  → 사용자·권한
```

PPT의 번호 설명과 Excel 행을 화면 ID로 묶되, 이름이 비슷하다는 이유만으로 같은 기능이라고 단정하지 않는다. `01_source_inventory.md`에는 화면별로 연결된 근거와 아직 연결되지 않은 행을 모두 남긴다.

### 2. 증거 원장을 완성한다

`02_evidence_ledger.csv`의 각 원문 단위를 다음 중 하나로 분류한다.

- `confirmed`: 두 원본이 일치하거나 한 원본에 명확하고 다른 원본과 충돌하지 않음
- `conflict`: 같은 항목에 서로 다른 값·범위·행동이 명시됨
- `ambiguous`: 주어, 조건, 단위, 예외 또는 완료 기준이 불명확함
- `candidate`: 문맥상 가능하지만 명시 요구사항으로 확정할 수 없음
- `out-of-scope`: 범위 밖 또는 향후 검토로 명시됨

원문을 정리해 쓰되 새로운 수치, 상태, 오류 코드, 일정, 우선순위를 만들지 않는다. 상세 기준은 [references/evidence-rules.md](references/evidence-rules.md)를 따른다.

### 3. 충돌과 질문을 먼저 분리한다

`conflict`, `ambiguous`, `candidate`는 확정 요구사항으로 쓰지 않는다. `OPEN_QUESTIONS.md`에 질문, 선택 가능한 해석, 각 해석의 원본 위치, 결정의 영향을 남긴다.

PPT가 항상 상위 문서이거나 Excel이 항상 최신이라고 가정하지 않는다. 파일명, 수정 시각, 표현의 강도만으로 우선순위를 정하지 않는다.

### 4. 검증 가능한 SPEC을 쓴다

[references/spec-template.md](references/spec-template.md)의 구조를 사용한다.

- 기능 요구사항: `FR-001`부터 시작
- 비기능 요구사항: `NFR-001`부터 시작
- 인수 조건: `AC-001`부터 시작하며 Given/When/Then 또는 동등하게 검증 가능한 문장 사용
- 모든 MUST 요구사항은 `TRACEABILITY.csv`의 원본 위치와 연결
- 범위 밖과 미결정 항목은 확정 범위와 분리
- UI 배치나 파일 색상을 업무 규칙으로 승격하지 않음

### 5. 추적성과 완전성을 검사한다

```bash
python .claude/skills/office-to-spec/scripts/validate_spec.py \
  --spec reverse-spec/output/SPEC.md \
  --traceability reverse-spec/output/TRACEABILITY.csv \
  --questions reverse-spec/output/OPEN_QUESTIONS.md
```

오류가 있으면 SPEC 또는 추적표를 수정하고 다시 실행한다. `QA_REPORT.md`에는 Source coverage, Traceability, Conflict safety, Testability, Residual risk를 기록한다.

## 완료 조건

- PPT 전 장과 Excel 전 시트를 확인했다.
- 모든 화면 ID에 사용자, 주요 항목, 이벤트, 성공·실패 결과를 대조했다.
- 모든 `FR`, `NFR`, `AC`가 추적표에 있다.
- 출처 없는 MUST 문장이 없다.
- 충돌·모호함은 요구사항이 아니라 질문으로 남아 있다.
- 범위 밖 항목이 구현 범위처럼 보이지 않는다.
- 검증 스크립트가 오류 없이 통과한다.
- 생성된 SPEC을 원본을 보지 않은 사람이 읽어도 구현 범위와 완료 조건을 설명할 수 있다.

## 금지

- 읽기 어려운 도형이나 빈 셀을 상상으로 채우지 않는다.
- 제품 효과, 운영 수치, 권한 정책, 성능 목표를 추정하지 않는다.
- 충돌한 값을 조용히 하나로 선택하지 않는다.
- PPT/Excel 원본을 SPEC에 맞추기 위해 수정하지 않는다.
- 모호한 표현(`적절히`, `빠르게`, `필요 시`)을 확정 요구사항에 사용하지 않는다.
