# 포함된 예제 Office → SPEC Brief

이 파일은 범용 `office-to-spec` Skill에 포함된 예제의 입력과 문서 유형만 전달한다. 다른 프로젝트에서는 이 파일만 교체하고 Skill과 검증기는 그대로 재사용한다.

## 입력

- `reverse-spec/input/roomflow_screen_definition.pptx`
- `reverse-spec/input/roomflow_function_definition.xlsx`

## 문서 프로필

- 유형: UI·제품 명세
- 대상: 가상 회의실 예약 서비스 `RoomFlow`
- 연결 키: 화면 ID, 기능 ID, 필드명, 이벤트 ID, 상태명
- 공식 원본 우선순위: 없음. PPT와 Excel 중 하나를 자동으로 우선하지 않는다.

## 조사 범위

- PowerPoint 8장 전체와 발표자 노트
- Excel 7개 시트 전체
- 화면 항목, 필수 여부, 버튼·이벤트, 상태 전이, 메시지, 권한
- Excel 수식과 데이터 검증

## 결과

- 결과 폴더: `reverse-spec/output/`
- 언어: 한국어
- 요구사항 ID: `FR-001`, `NFR-001`, `AC-001`, `OPEN-001`부터 시작
- 필수 파일:
  - `01_source_inventory.md`
  - `02_evidence_ledger.csv`
  - `SPEC.md`
  - `TRACEABILITY.csv`
  - `OPEN_QUESTIONS.md`
  - `QA_REPORT.md`

## 완료 조건

- 모든 입력 장·시트를 inventory에서 확인한다.
- 모든 evidence 행의 분류와 normalized claim을 채운다.
- 충돌·모호함·후보는 질문으로 분리한다.
- confirmed 증거만 요구사항과 AC에 사용한다.
- validator가 `passed`를 반환해야 한다.
