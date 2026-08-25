# Project Instructions — Solution to PPT

## Source hierarchy

1. 제품 계약: `../docs/SPEC.md`
2. 구조·API·소유권: `../docs/ARCHITECTURE.md`
3. 결정 이유·AI 권한: `../docs/adr/ADR-001.md`, `../docs/rfc/RFC-001.md`
4. 판정 근거: `../tests/test_*.py`
5. 검증된 변화: `../CHANGELOG.md`
6. 세부 설명이 필요할 때만 `../src/`

문서가 충돌하면 자동으로 합치지 말고 `output/open_questions.md`에 양쪽 위치를 기록합니다.

## Workflow

1. `.claude/skills/create-solution-ppt/SKILL.md`와 `.claude/skills/pptx/SKILL.md`를 모두 읽습니다.
2. `source_map.md`, `storyboard.md`, `outline.json`을 승인된 기준선으로 사용합니다.
3. 계획 설명에서 멈추지 말고 `generator/build_solution_ppt.js`를 실행해 PPT 전체를 만듭니다.
4. 공식 `pptx` Skill의 검증 도구로 Office 구조를 검사하고, 전 장을 PNG로 렌더링합니다.
5. 접촉 시트와 개별 슬라이드를 눈으로 확인해 겹침·잘림·작은 글씨·반복 구성을 수정합니다.
6. 수정은 `.pptx` 결과물이 아니라 `outline.json` 또는 생성 소스에 먼저 반영하고 다시 빌드합니다.
7. `output/qa_report.md`까지 작성한 뒤에만 완료라고 보고합니다.

## Output contract

- 모든 산출물은 `output/`에 저장합니다.
- 숫자·코드·상태·API 주장에 원본 위치를 붙입니다.
- 발표자 노트에 30~50초 설명과 다음 장 연결 문장을 넣습니다.
- `qa_report.md`를 Fact, Structure, Visual, Repeatability로 구분합니다.
- 원본 강연의 주황 상단 바·흰 본문·짙은 코드 패널·파란 근거 도형 문법을 유지합니다.
- 학교·회사 로고는 사용자 승인 자산이 없으므로 새로 넣지 않습니다.

## Safety

- `docs/`, `src/`, `tests/`, `CHANGELOG.md`를 수정하지 않습니다.
- 원격 push·업로드·배포를 자동으로 수행하지 않습니다.
- 저장소에 없는 효과 수치와 회사 템플릿을 추정하지 않습니다.
