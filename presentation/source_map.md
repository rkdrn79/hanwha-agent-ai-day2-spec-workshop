# Source Map — IPS WBS solution 발표

| ID | 핵심 주장 | 계약 근거 | 판정 근거 | 사용 장 | 주의 |
|---|---|---|---|---:|---|
| SM-01 | 핵심 데모는 `100 → 88 → 100`이다 | `docs/SPEC.md` §7 | `test_service.py` AC-08·11 | 1·3·7 | 출고 수량 12 기준 |
| SM-02 | 상태는 `COMPLETED`, `CANCELED` 두 개뿐이다 | `docs/SPEC.md` §3 | AC-08·11·12 | 3 | 실패를 상태로 만들지 않음 |
| SM-03 | 실패는 재고·이력·request_id를 바꾸지 않는다 | `docs/SPEC.md` §5 | AC-09·10·12 | 2·4 | 원자성으로 표현 |
| SM-04 | 중복 request_id는 성공 재응답이 아니라 거부다 | `docs/SPEC.md` §4 | AC-10·API duplicate | 4 | 차감은 1회 |
| SM-05 | 취소는 원 출고 수량 전체만 가능하다 | `docs/SPEC.md` §2·4 | AC-11·12 | 3·4 | 부분 취소는 범위 밖 |
| SM-06 | 일반·가수주·하자보수에 세 코드 쌍을 쓴다 | `docs/SPEC.md` §2 | engine AC-04·service AC-13 | 5 | 출고·취소 쌍 유지 |
| SM-07 | 저장소 변경 전에 모든 업무 검증을 끝낸다 | `ADR-001`, `ARCHITECTURE.md` §2 | AC-09·10·12 | 4·6 | 호출 순서가 계약 |
| SM-08 | Frontend와 Backend는 API 계약과 배타 소유권으로 병행했다 | `ARCHITECTURE.md` §4–5 | RFC G1–G7 | 6 | tests·제공 파일 읽기 전용 |
| SM-09 | 자동 테스트 `23/23`과 브라우저 스모크가 완료를 판정했다 | `CHANGELOG.md` LOOP-04 | `tests/test_*.py`, 실행 기록 | 7 | 제품 효과가 아닌 검증 결과 |
| SM-10 | SAP·권한·부분 취소·운영 DB는 범위 밖이다 | `docs/SPEC.md` §1 | RFC·README 범위 대조 | 8 | 다음 단계처럼 확정 금지 |

## 발표에서 쓰지 않는 주장

- 재고 오류 감소율·업무 시간 절감율
- 운영 배포 완료
- 멀티 워커·동시 요청 보장
- 실제 SAP 연동 일정

위 내용은 저장소 근거가 없거나 명시적 범위 밖입니다.
