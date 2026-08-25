---
name: create-solution-ppt
description: 완성된 IPS WBS solution 브랜치의 SPEC·Architecture·tests·CHANGELOG를 근거로 8장 편집 가능한 PPT 전체와 렌더·QA 보고서를 만들 때 사용한다. 공식 pptx Skill과 함께 사용한다.
---

# Solution → PPT 실행 절차

이 Skill은 발표자료의 사실성과 생성 순서를 고정한다. 제품 규칙을 이 파일에 복사하지 말고 아래 승인 문서를 원문으로 읽는다.

## 1. 근거 읽기

다음 순서를 지킨다.

1. `docs/SPEC.md` — 범위·상태·불변조건·인수 조건
2. `docs/ARCHITECTURE.md` — 계층·API·검증 순서·파일 소유권
3. `docs/adr/ADR-001.md` — 저장소 변경 전 검증 결정
4. `docs/rfc/RFC-001.md` — AI 권한·중단 조건·품질 Gate
5. `tests/test_*.py` — 완료 판정 근거
6. `CHANGELOG.md` — 검증된 제품 변화
7. 세부 구현 설명이 필요할 때만 `src/`

출처가 다르면 자동으로 하나를 고르지 말고 `presentation/output/open_questions.md`에 양쪽 위치를 남긴다.

## 2. 기준선 확인

`presentation/source_map.md`, `presentation/storyboard.md`, `presentation/outline.json`이 있으면 이미 승인된 제작 기준선으로 취급한다. 파일이 없거나 원문과 충돌할 때만 `presentation/output/open_questions.md`를 만들고 중단한다. 정상 상태에서는 계획 요약만 하고 PPT 전체 제작으로 바로 진행한다.

## 3. 발표자료 생성

- `.claude/skills/pptx/SKILL.md`를 함께 사용한다.
- 16:9, 8장, 한 장에 하나의 결론만 담는다.
- 제목은 주제형 명사가 아니라 메시지형 문장으로 쓴다.
- 반복 카드 그리드 대신 실제 파일 트리, 상태 흐름, 테스트 숫자, 근거 표를 사용한다.
- `presentation/STYLE.md`의 시각 계약을 준수한다.
- 숫자·상태·이동유형·API 문구를 원문과 표본 대조한다.
- 편집 가능한 PPT와 재생성 가능한 생성 소스를 함께 남긴다.
- 발표자 노트에 근거 경로와 다음 장으로 이어지는 문장을 적는다.
- 원본 2일차 강연의 시각 문법을 따르되 승인되지 않은 로고는 넣지 않는다.
- 계획이나 프롬프트 문서만 만들고 종료하지 않는다.

기본 결과 경로:

```text
presentation/output/
├─ ips_wbs_solution_brief.pptx
├─ contact_sheet.png
├─ qa_report.md
└─ renders/       # 로컬 QA용, 커밋하지 않아도 됨

presentation/
├─ outline.json
└─ generator/     # 재생성 소스
```

## 4. QA

1. Fact: `100 → 88 → 100`, `COMPLETED → CANCELED`, `23/23`, 이동유형 코드를 원문과 대조한다.
2. Structure: 문제 → 결정 → 데모 → 증거 흐름인지 제목만 읽어 확인한다.
3. Visual: 전 장을 렌더링하거나 PowerPoint에서 열어 겹침·잘림·작은 글씨를 확인한다.
4. Repeatability: 수정을 PPT 결과물이 아니라 생성 소스에 반영하고 다시 빌드한다.
5. 결과를 `presentation/output/qa_report.md`에 기록한다.
6. 구조 검증과 시각 검수를 통과하기 전에는 완료라고 말하지 않는다.

## 금지

- 저장소에 없는 제품 효과·일정·비용·운영 수치를 추정하지 않는다.
- SAP 연동·로그인·권한·부분 취소·운영 DB를 구현 범위로 표현하지 않는다.
- `tests/`나 승인 문서를 발표 내용에 맞추기 위해 수정하지 않는다.
- 회사 로고·고객명·비공개 템플릿을 임의로 추가하지 않는다.
