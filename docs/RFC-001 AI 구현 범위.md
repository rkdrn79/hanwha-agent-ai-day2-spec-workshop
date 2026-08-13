# RFC-001: IPS 출고·취소 핵심 규칙의 AI 구현 범위

- 상태: Accepted
- 작성일: 2026-08-13
- 요청자: 교육 실습 진행자
- 관련 SPEC: `docs/IPS MVP 구현스펙.md`
- 관련 ADR: `docs/ADR-001 출고와 취소의 원자성.md`
- 대상 인수 조건: `AC-01~06`, `AC-08~13`

## 1. 작업 목적

`student-start` 브랜치의 TODO를 구현하여 승인된 SPEC의 출고·취소 업무 규칙과 인수 조건을 만족합니다.

## 2. 완료 조건

- [ ] `src/engine.py`의 입력, 이동유형, 재고, 취소 상태 규칙을 구현합니다.
- [ ] `src/service.py`의 출고와 전체 취소 흐름을 구현합니다.
- [ ] `AC-01~13`과 API 회귀 테스트가 모두 통과합니다.
- [ ] RFC 밖 파일 변경이 없습니다.

## 3. AI 수정 허용 범위

| 파일 | 허용 작업 |
|---|---|
| `src/engine.py` | 기존 함수의 TODO 구현, 필요한 최소 내부 헬퍼 수정 |
| `src/service.py` | 기존 함수의 TODO 구현, 필요한 최소 내부 헬퍼 수정 |

새 파일 생성은 허용하지 않습니다.

### 읽기 전용 파일

- `docs/IPS MVP 기능명세.md`
- `docs/IPS MVP 구현스펙.md`
- `docs/ADR-001 출고와 취소의 원자성.md`
- `src/app.py`, `src/store.py`, `src/data.py`, `src/index.html`
- `tests/test_engine.py`, `tests/test_service.py`, `tests/test_api.py`

## 4. AI 수정 금지 범위

- `docs/`, `tests/`, `README.md`, `CHANGELOG.md`는 AI 구현 단계에서 수정하지 않습니다.
- 테스트 삭제, skip 추가, 기대값 변경을 금지합니다.
- API 경로와 요청·응답 필드를 변경하지 않습니다.
- `src/store.py`의 메모리 저장 방식과 데모 데이터를 변경하지 않습니다.
- 파일 이동, 모듈 통합, 전면 리팩터링을 하지 않습니다.
- SAP, 데이터베이스, 인증, 결재, 메일, 부분 출고·취소를 추가하지 않습니다.
- 새 패키지나 외부 네트워크 호출을 추가하지 않습니다.

## 5. 구현 제약

- 업무 검증은 `engine.py`, 유스케이스 순서는 `service.py`에 둡니다.
- 화면과 API에 업무 규칙을 중복 구현하지 않습니다.
- 모든 검증을 통과한 뒤에만 저장소의 재고와 이력을 변경합니다.
- 오류 메시지는 SPEC의 오류 계약을 따릅니다.
- 문자열과 WBS 정규화 방식은 SPEC의 `FR-01`과 이동유형 결정표를 따릅니다.

## 6. 작업 순서

1. SPEC, ADR, 테스트를 읽습니다.
2. 구현할 ID와 두 수정 파일을 요약합니다.
3. `engine.py`의 순수 규칙을 먼저 구현하고 관련 테스트를 실행합니다.
4. `service.py`의 출고·취소 흐름을 구현하고 관련 테스트를 실행합니다.
5. 전체 회귀 테스트를 실행합니다.
6. 변경 파일, 통과한 ID, 남은 위험을 보고합니다.

## 7. 중단·질문 조건

다음 상황에서는 임의로 해결하지 않고 작업을 중단합니다.

- SPEC과 테스트의 기대 결과가 다른 경우
- `engine.py`, `service.py` 밖의 수정이 필요한 경우
- 부분 처리나 새 상태가 필요하다고 판단되는 경우
- 새 의존성 또는 외부 연동이 필요한 경우
- 재고·이력 일관성을 보장할 수 없는 경우

## 8. 검증

```bash
python -m unittest tests.test_engine -v
python -m unittest tests.test_service -v
python -m unittest discover -s tests -v
```

수동 검증은 README의 재고 100 → 출고 12 → 재고 88 → 전체 취소 → 재고 100 시나리오를 사용합니다.

## 9. 완료 보고 형식

```text
변경한 파일:
구현한 SPEC/AC ID:
실행한 검증과 결과:
RFC 밖 변경: 없음
CHANGELOG 후보 문구:
남은 위험:
```

구현이 검증된 뒤 사람이 `CHANGELOG.md`에 실제 변경을 기록합니다.
