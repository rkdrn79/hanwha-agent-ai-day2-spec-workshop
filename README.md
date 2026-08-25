# Spec ↔ Office 실습

완성된 프로젝트의 문서와 테스트를 **발표자료로 바꾸는 방법**과, PPT·Excel에 흩어진 요구사항을 **구현 가능한 SPEC으로 복원하는 방법**을 실습합니다.

```text
Part 1 · Spec → PPT          Part 2 · PPT + Excel → Spec
문서·테스트 → 발표자료       업무자료 → 증거 → 질문 → SPEC
```

두 번째 실습이 핵심입니다. Office 파일을 단순 요약하지 않고, 모든 요구사항을 원본 위치와 연결하고 충돌·모호함은 사람이 결정할 질문으로 남깁니다.

전체 실습은 30분 기준입니다. Part 1은 흐름을 빠르게 확인하고, Part 2에서 화면설계서와 기능정의서를 SPEC으로 복원하는 데 더 많은 시간을 씁니다.

## 시작하기

```bash
git clone https://github.com/rkdrn79/hanwha-agent-ai-day2-spec-workshop.git
cd hanwha-agent-ai-day2-spec-workshop
git switch solution-to-ppt-workshop
claude
```

이 브랜치에는 프로젝트 전용 Skill과 공식 파일 처리 Skill이 들어 있습니다.

| Skill | 역할 |
|---|---|
| `create-solution-ppt` | solution의 문서·테스트에서 발표 근거를 찾음 |
| `office-to-spec` | PPT·Excel의 충돌을 보존하며 SPEC과 추적표를 만듦 |
| `pptx` | PowerPoint 읽기·생성·렌더링·검증 |
| `xlsx` | Excel 값·수식·시트·검증 규칙 읽기 |

---

# Part 1. Spec → PPT

완성된 IPS WBS solution을 프로젝트·업무 리더가 5분 안에 이해할 수 있는 발표자료로 만듭니다.

자세한 설명: [`presentation/README.md`](presentation/README.md)

## Prompt 1 — PPT 전체 만들기

아래를 Claude Code에 그대로 붙여 넣습니다.

```text
이 저장소의 create-solution-ppt Skill과 pptx Skill을 사용해줘.

docs/SPEC.md, docs/ARCHITECTURE.md, ADR, RFC, tests, CHANGELOG를 읽고
프로젝트·업무 리더가 5분 안에 이해할 수 있는 16:9 발표자료 8장을 만들어줘.

presentation/source_map.md, presentation/storyboard.md,
presentation/outline.json은 승인된 제작 기준선으로 사용해.

원래 2일차 강연자료처럼 주황색 상단 바, 흰색 본문,
짙은 설명 패널과 파란 근거 도형을 사용해.

구성안만 쓰고 멈추지 말고 다음을 모두 끝내줘.
1. 편집 가능한 PPTX 생성
2. 전 슬라이드 렌더링과 접촉 시트 생성
3. 겹침·잘림·작은 글씨·어색한 줄바꿈 수정
4. Office 구조 검증
5. QA 보고서 작성

최종 파일은 presentation/output에 저장해줘.
```

완료 후 다음 파일을 확인합니다.

```text
presentation/output/
├─ ips_wbs_solution_brief.pptx
├─ contact_sheet.png
└─ qa_report.md
```

## Prompt 2 — PPT self-refinement

```text
방금 만든 PPT를 create-solution-ppt와 pptx Skill로 다시 검토해줘.

contact_sheet.png와 개별 슬라이드 렌더를 실제로 보고,
제목만 읽었을 때 문제 → 결정 → 데모 → 증거가 이어지는지 확인해.

다음 항목을 우선순위 순으로 찾아줘.
1. 한 장에 결론이 둘 이상인 슬라이드
2. 근거보다 장식이 먼저 보이는 슬라이드
3. 작은 글씨, 잘림, 겹침, 어색한 줄바꿈
4. 같은 레이아웃이 반복되는 구간
5. 원문과 대조되지 않은 숫자·상태·코드

발견한 문제를 presentation/outline.json 또는 generator 소스에서 수정하고
PPT 전체를 다시 생성·렌더링·검증해.
PPTX 결과물을 직접 패치하지 마.
```

---

# Part 2. PPT + Excel → Spec

실습용 입력 파일은 실제 프로젝트 산출물의 형식만 참고해 새로 만든 가상 서비스 `RoomFlow` 자료입니다. 특정 회사·프로젝트의 내용이나 화면 ID는 사용하지 않았습니다.

- [RoomFlow 화면설계서 PowerPoint](reverse-spec/input/roomflow_screen_definition.pptx)
- [RoomFlow 기능정의서 Excel](reverse-spec/input/roomflow_function_definition.xlsx)
- [실습 상세 안내](reverse-spec/README.md)

두 파일에는 의도적으로 다음이 섞여 있습니다.

- 화면 ID, 입력 필드, 버튼 이벤트, 상태 전이처럼 서로 일치하는 UI 명세
- 기본 조회 기간 `7일`과 `30일`의 충돌
- 취소 제한 `시작 2시간 전`과 `4시간 전`의 충돌
- 예약 목적의 필수 여부 충돌
- “빠르게”처럼 측정할 수 없는 표현
- 알림 채널과 대리 승인처럼 아직 확정되지 않은 후보
- 반복 예약·출입 QR처럼 명시적으로 제외된 기능

정답을 먼저 보지 않으려면 `reverse-spec/expected/`는 실습이 끝난 뒤 엽니다.

## Prompt 1 — 원본 조사만 하기

```text
office-to-spec, pptx, xlsx Skill을 모두 사용해줘.

다음 두 파일을 원본으로 조사해.
- reverse-spec/input/roomflow_screen_definition.pptx
- reverse-spec/input/roomflow_function_definition.xlsx

아직 SPEC을 작성하지 마.

1. office-to-spec의 추출 스크립트를 실행해 source inventory와 evidence ledger를 만들어.
2. PPT 8장을 모두 렌더링해 화면, 번호 설명, 발표자 노트를 확인해.
3. Excel 7개 시트의 값, 수식, 데이터 검증, 검토중 항목을 확인해.
4. 각 원문에 PPT:S번호 또는 XLSX:시트!셀범위 위치를 남겨.

결과를 reverse-spec/output의
01_source_inventory.md와 02_evidence_ledger.csv에 저장하고 멈춰.
```

다음 단계로 가기 전, `01_source_inventory.md`에 PPT 8장과 Excel 7개 시트가 모두 기록됐는지 확인합니다.

## Prompt 2 — 증거를 분류하고 질문 만들기

```text
office-to-spec Skill의 evidence rules를 적용해
reverse-spec/output/02_evidence_ledger.csv를 완성해줘.

각 증거를 confirmed, conflict, ambiguous, candidate, out-of-scope 중 하나로 분류해.

중요:
- PPT가 항상 상위 문서라고 가정하지 마.
- Excel이 더 상세하다는 이유만으로 자동 확정하지 마.
- 충돌과 모호함에는 FR ID를 부여하지 마.
- 새로운 숫자, 상태, 오류 코드, 일정, 성능 목표를 만들지 마.

conflict, ambiguous, candidate는 질문·선택지·원본 위치·영향을 포함해
reverse-spec/output/OPEN_QUESTIONS.md로 분리하고 멈춰.
```

다음 단계로 가기 전, 조회 기간·취소 제한·예약 목적 필수 여부·응답 기준이 OPEN 질문으로 분리됐는지 확인합니다.

## Prompt 3 — 확정 증거만 SPEC으로 만들기

```text
office-to-spec Skill의 spec template을 사용해
reverse-spec/output/SPEC.md와 TRACEABILITY.csv를 작성해줘.

confirmed 증거만 확정 요구사항으로 사용해.
conflict, ambiguous, candidate는 SPEC의 미결정 사항에서만 참조해.

요구사항 ID:
- 기능 요구사항 FR-001부터
- 비기능 요구사항 NFR-001부터
- 인수 조건 AC-001부터

모든 FR, NFR, AC는 TRACEABILITY.csv에서
원본 위치와 검증 방법에 연결해.

Given/When/Then으로 정상 예약 요청, 잘못된 시간,
정원 초과, 같은 회의실·시간 중복, 승인, 반려 사유 누락,
이미 처리된 요청의 재처리를 검증해.

아직 결정되지 않은 조회 기간, 취소 제한, 예약 목적 필수 여부,
응답 시간, 알림 채널, 대리 승인 정책을 임의로 확정하지 마.
문서 상태는 Draft로 유지해.
```

## Prompt 4 — 자동 검증과 red-team

```text
office-to-spec Skill의 validate_spec.py를 실행해
SPEC.md, TRACEABILITY.csv, OPEN_QUESTIONS.md를 검증해줘.

그다음 원본 PPT와 Excel을 다시 열고 red-team 검토를 해.

반드시 확인할 것:
1. 모든 FR/NFR/AC가 추적표에 있는가
2. 모든 확정 요구사항에 실제 원본 위치가 있는가
3. 조회 7일/30일, 취소 2시간/4시간, 예약 목적 필수 여부를 조용히 선택하지 않았는가
4. “빠르게”를 임의의 응답 시간으로 바꾸지 않았는가
5. 반복 예약·출입 QR이 범위 안으로 들어오지 않았는가
6. 검증 실패 시 예약 미생성 또는 기존 상태 유지가 인수 조건으로 검증되는가

오류가 있으면 원천 Markdown과 CSV를 수정한 뒤 검증을 다시 실행해.
같은 오류가 없고 validator가 passed일 때만 완료해.

최종 결과와 남은 결정 사항을 reverse-spec/output/QA_REPORT.md에 기록해.
```

## 시간이 부족할 때 — 한 번에 완주하는 Prompt

```text
office-to-spec, pptx, xlsx Skill을 모두 사용해
reverse-spec/input의 PPT와 Excel을 추적 가능한 SPEC으로 변환해줘.

원본 조사 → 전 장·전 시트 확인 → 증거 원장 → 충돌·모호함 분리
→ OPEN 질문 → SPEC → TRACEABILITY → 자동 검증 → red-team 수정까지 수행해.

confirmed만 확정 요구사항으로 사용하고,
7일/30일, 2시간/4시간, 목적 필수 여부의 충돌과
측정 불가능한 “빠르게”를 임의로 결정하지 마.

reverse-spec/output에 다음 6개 파일이 모두 있고
validate_spec.py가 passed일 때만 완료를 보고해.

01_source_inventory.md
02_evidence_ledger.csv
SPEC.md
TRACEABILITY.csv
OPEN_QUESTIONS.md
QA_REPORT.md
```

## 최종 통과 기준

- [ ] Spec → PPT 결과가 실제 `.pptx` 파일로 생성됐다.
- [ ] PPT 전 장을 렌더링하고 시각 문제를 수정했다.
- [ ] PPT 8장과 Excel 7개 시트를 모두 확인했다.
- [ ] 모든 `FR`, `NFR`, `AC`에 원본 위치가 있다.
- [ ] 충돌·모호함을 질문으로 남겼다.
- [ ] 범위 밖 기능을 확정 범위에 넣지 않았다.
- [ ] `validate_spec.py`가 `passed`를 반환했다.

저장소 전체를 한 번에 점검하려면 실행합니다.

```bash
python scripts/verify_workshop.py
```

## 저장소 구조

```text
presentation/              # Part 1 · Spec → PPT
reverse-spec/
├─ input/                   # Part 2 실습용 PPT·Excel
├─ output/                  # 참가자 결과
├─ expected/                # 비교용 정답 예시
├─ previews/                # 입력 파일 미리보기
└─ generator/               # 예시 파일 재생성 소스

.claude/skills/
├─ create-solution-ppt/
├─ office-to-spec/
├─ pptx/
└─ xlsx/
```

기존 IPS MVP 구현 실습의 업무 요청은 [`docs/요청사항/README.md`](docs/요청사항/README.md)에 남아 있습니다.
