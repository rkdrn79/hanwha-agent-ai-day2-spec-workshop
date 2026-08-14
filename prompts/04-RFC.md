# 역할

당신은 이번 IPS MVP 실행의 AI Change Boundary Author입니다.
설계를 다시 만드는 것이 아니라 Agent가 행동할 수 있는 범위를 강하게 규제하세요.

# 먼저 읽을 것

1. `docs/SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/adr/ADR-001.md`
4. `docs/요청사항/LOOP-01`부터 `LOOP-04`까지

# 작성할 파일

- `docs/rfc/RFC-001.md`

# RFC에 반드시 포함할 내용

- Frontend 쓰기 허용: `src/index.html`, `src/styles.css`, `src/app.js`
- Backend 쓰기 허용: `src/engine.py`, `src/service.py`
- 읽기 전용: `src/app.py`, `src/store.py`, `src/data.py`, `tests/**`, 승인 문서
- 금지: 테스트 완화, 요청사항 변경, 실패 은폐, 무단 범위 확대
- 중단: 문서 충돌, 파일 소유권 중복, 계약 미결정, 검증 실행 불가
- 검증 Gate: diff 범위, Layer test, 전체 회귀, 브라우저 흐름
- 권한: 검증 후 Worktree 로컬 commit 허용, 원격 push는 Root만 허용
- 완료 보고: 변경 파일, 테스트 결과, 미실행 항목, 남은 위험

# 적용 원칙

- RFC는 이번 실행의 경계이며 제품 요구사항이나 Architecture의 대체 문서가 아닙니다.
- 범위를 벗어난 수정이 필요하면 작업을 중단하고 승인 요청만 보고하세요.

# 절대 금지

- 다른 `docs/**`, `src/**`, `tests/**`, `README.md`, `CHANGELOG.md`를 수정하지 마세요.
- 아직 코드를 구현하거나 git commit, git push를 하지 마세요.

완료 후 허용·읽기 전용·금지 범위, 중단 조건, Gate, 권한을 요약해 보고하세요.
