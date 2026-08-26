# Office → SPEC project Brief template

새 프로젝트에서는 아래 항목을 복사해 작업 폴더의 `BRIEF.md`에 채운다. 파일 수나 문서 유형을 미리 고정하지 않는다.

```markdown
# [프로젝트명] Office → SPEC Brief

## 입력
- `path/to/source.pptx`
- `path/to/rules.xlsx`

## 문서 프로필
- 유형: UI·제품 / 업무 프로세스 / 정책·규정 / 데이터·인터페이스 / 혼합
- 대상:
- 연결 키:
- 공식 원본 우선순위: 없음 / [승인된 우선순위와 근거]

## 조사 범위
- 포함할 슬라이드·시트·노트·수식·검증:
- 제외할 범위와 이유:

## 결과
- 결과 폴더:
- 언어:
- 요구사항 시작 번호: `FR-001`, `NFR-001`, `AC-001`, `OPEN-001`
- 필수 파일: `01_source_inventory.md`, `02_evidence_ledger.csv`, `SPEC.md`,
  `TRACEABILITY.csv`, `OPEN_QUESTIONS.md`, `QA_REPORT.md`

## 완료 조건
- 모든 지정 입력과 범위를 inventory에서 확인한다.
- 모든 evidence 행을 분류한다.
- 미결정 내용은 질문으로 분리한다.
- confirmed 증거만 확정 요구사항에 사용한다.
- validator가 `passed`를 반환한다.
```

공식 원본 우선순위가 있더라도 충돌한 원문을 삭제하지 않는다. 우선순위는 결정 근거이며, 출처를 숨기는 규칙이 아니다.
