---
name: office-to-spec
description: 하나 이상의 PowerPoint·Excel 업무자료를 원본 위치가 추적되는 Markdown SPEC으로 변환한다. 문서 유형과 파일 수에 고정되지 않고 충돌·모호함·범위 밖 항목을 보존하면서 요구사항, 인수 조건, 추적표, 미결정 질문을 만들 때 사용한다.
---

# Office evidence → Spec

Office 파일을 요약하는 데서 멈추지 않고, 원본 위치가 연결된 요구사항과 사람이 결정해야 할 질문을 분리한다. 특정 제품명, 화면 수, 시트 수, 폴더 구조를 가정하지 않는다.

## 1. 작업 Brief와 입력을 확정한다

다음 우선순위로 작업 조건을 결정한다.

1. 사용자가 현재 요청에서 지정한 파일·출력·문서 유형
2. 사용자가 지정한 Brief
3. 작업 폴더의 `BRIEF.md` 또는 `reverse-spec/BRIEF.md`
4. 위 정보가 없을 때 발견한 `.pptx`·`.xlsx` 후보를 보고 선택

Brief에서 다음을 확인한다.

- 입력 파일 목록과 우선순위
- 문서 프로필: UI·제품, 업무 프로세스, 정책·규정, 데이터·인터페이스, 혼합
- 같은 대상을 연결하는 키: 화면 ID, 기능 ID, 프로세스 단계, 정책 번호, 필드명 등
- 결과 폴더와 언어
- 요구사항 ID 시작 번호와 필수 산출물. 기본 validator를 사용할 때 접두사는 `FR`·`NFR`·`AC`를 유지
- 원본 간 우선순위가 공식적으로 정해져 있는지

파일명·수정 시각·표현의 강도만으로 원본 우선순위를 만들지 않는다. Brief에 명시된 공식 우선순위도 충돌 사실 자체를 evidence ledger에서 삭제하는 근거로 사용하지 않는다.

문서 프로필별 조사 관점이 필요하면 [references/document-profiles.md](references/document-profiles.md)를 읽는다.
새 프로젝트용 Brief는 [references/brief-template.md](references/brief-template.md)를 복사해 작성한다.

## 2. 파일 형식별로 원본을 조사한다

- PowerPoint가 있으면 사용 가능한 `pptx` Skill로 본문·표·발표자 노트·시각적 관계를 확인한다.
- Excel이 있으면 사용 가능한 `xlsx` Skill로 값·수식·주석·데이터 검증·숨김 시트·시트 구조를 확인한다.
- 존재하지 않는 형식의 Skill을 억지로 호출하지 않는다.
- 텍스트 추출만으로 의미가 불분명한 슬라이드는 렌더링해 확인한다.

원본 파일을 수정하지 않는다.

## 3. 원자 단위 evidence ledger를 만든다

추출 스크립트는 하나 이상의 `--pptx`, `--xlsx`를 받을 수 있으며 둘 중 한 형식만 있어도 실행된다.

```bash
python .claude/skills/office-to-spec/scripts/extract_office_evidence.py \
  --pptx path/to/first.pptx \
  --pptx path/to/second.pptx \
  --xlsx path/to/rules.xlsx \
  --output-dir path/to/output
```

출력:

```text
01_source_inventory.md
02_evidence_ledger.csv
```

PPT는 슬라이드 한 장을 한 증거로 뭉치지 않는다. 파일명·본문 블록·표 행·노트를 포함한 locator를 사용한다.

```text
PPTX:screen.pptx#S3:B07
PPTX:screen.pptx#S3:T04-R02
PPTX:screen.pptx#S3:NOTES
```

Excel은 파일명·시트·범위를 포함하고 수식과 데이터 검증을 원문에 표시한다.

```text
XLSX:rules.xlsx#Policy!A5:J5
XLSX:rules.xlsx#Limits!D12:D12 (formula)
```

상세 기준은 [references/evidence-rules.md](references/evidence-rules.md)를 따른다.

## 4. 모든 증거를 분류한다

`02_evidence_ledger.csv`의 각 행에 `classification`과 `normalized_claim`을 채운다.

- `confirmed`: 명확하고 다른 확인된 원본과 충돌하지 않음
- `conflict`: 같은 대상에 서로 다른 값·범위·행동이 명시됨
- `ambiguous`: 주체·조건·단위·예외·완료 기준이 불명확함
- `candidate`: 가능성은 있지만 확정 요구사항으로 볼 수 없음
- `out-of-scope`: 범위 밖 또는 후속 단계로 명시됨

새로운 수치, 상태, 오류 코드, 일정, 우선순위, 권한을 만들지 않는다. 분류를 비워 둔 행이 하나라도 있으면 완료하지 않는다.

## 5. 미결정 내용을 질문으로 분리한다

`conflict`, `ambiguous`, `candidate`는 확정 요구사항으로 쓰지 않는다. `OPEN_QUESTIONS.md`에 다음을 남긴다.

- 질문과 OPEN ID
- 선택 가능한 해석
- 각 해석의 원본 파일과 locator
- 결정에 따른 구현·검증 영향

`out-of-scope`는 범위 밖 항목으로 보존한다.

## 6. confirmed 증거만 SPEC으로 만든다

[references/spec-template.md](references/spec-template.md)의 공통 구조를 사용하고, Brief의 문서 프로필에 맞게 세부 항목을 조정한다.

- 기능 요구사항은 기본적으로 `FR-001`부터 시작한다.
- 비기능 요구사항은 `NFR-001`부터 시작한다.
- 인수 조건은 `AC-001`부터 시작한다.
- 각 AC에 검증 대상 FR/NFR ID를 명시한다.
- 모든 FR을 하나 이상의 Given/When/Then AC에 연결한다.
- 모든 확정 요구사항을 `TRACEABILITY.csv`의 실제 locator와 검증 방법에 연결한다.
- 원본에 없는 섹션은 추정하지 말고 `원본에 명시되지 않음`으로 표시한다.

기본 결과 파일은 다음과 같으며 경로는 사용자 요청 또는 Brief를 따른다.

```text
SPEC.md
TRACEABILITY.csv
OPEN_QUESTIONS.md
QA_REPORT.md
```

## 7. 추적성과 완전성을 검사한다

```bash
python .claude/skills/office-to-spec/scripts/validate_spec.py \
  --spec path/to/SPEC.md \
  --traceability path/to/TRACEABILITY.csv \
  --questions path/to/OPEN_QUESTIONS.md \
  --evidence path/to/02_evidence_ledger.csv
```

오류가 있으면 SPEC만 고치지 말고 증거 원장·질문·추적표 중 실제 원인이 있는 파일을 수정한다. 원본을 다시 대조하는 red-team 검토 후 `QA_REPORT.md`에 Source coverage, Traceability, Conflict safety, Testability, Residual risk를 기록한다.

## 완료 조건

- Brief 또는 사용자 요청에 지정된 모든 입력 파일을 확인했다.
- 문서 프로필의 연결 키와 핵심 관계를 조사했다.
- 모든 evidence 행이 분류됐다.
- 모든 FR·NFR·AC가 추적표에 있고 실제 confirmed locator를 참조한다.
- 모든 미결정 evidence locator가 OPEN 질문에 남아 있다.
- 모든 FR이 Given/When/Then AC에서 검증된다.
- 범위 밖 항목이 구현 범위처럼 보이지 않는다.
- validator가 오류 없이 통과한다.
- 원본을 보지 않은 사람이 구현 범위·완료 조건·남은 결정을 설명할 수 있다.

## 금지

- 특정 예제의 제품명·화면 수·시트 수·폴더 경로를 다른 작업에 강제하지 않는다.
- 읽기 어려운 도형이나 빈 셀을 상상으로 채우지 않는다.
- 충돌한 값을 조용히 하나로 선택하지 않는다.
- 측정할 수 없는 표현을 임의의 수치나 NFR로 바꾸지 않는다.
- 원본 Office 파일을 SPEC에 맞추기 위해 수정하지 않는다.
