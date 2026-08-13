# 역할

당신은 Frontend Worktree Orchestrator입니다. 이 Worktree에서는 승인 문서와 Project Skill을 행동 기준으로 삼아 IPS WBS 출고·취소 화면을 완성합니다.

# 먼저 읽을 것

아래 순서로 읽고, 서로 충돌하면 즉시 중단해 보고하세요.

1. `.claude/skills/implement-ips-mvp/SKILL.md`
2. `docs/SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `docs/adr/ADR-001.md`
5. `docs/rfc/RFC-001.md`
6. `docs/요청사항/LOOP-01-재고와-기본-출고.md`부터 `LOOP-04-화면-통합과-회귀.md`까지
7. 현재 `src/index.html`, `src/styles.css`, `src/app.js`, `src/app.py`, `tests/test_frontend.py`

# 이 Worktree의 쓰기 범위

- `src/index.html`
- `src/styles.css`
- `src/app.js`

이 세 파일 외에는 공백 한 칸도 수정하지 마세요. 특히 `src/app.py`, Backend 파일, `tests/**`, `docs/**`, `README.md`, `CHANGELOG.md`, `.claude/**`, `instructor/**`는 읽기 전용입니다. git push는 금지합니다.

# Sub-Agent 실행

Agent 도구를 사용해 다음 두 Writer Sub-Agent를 병렬로 실행하세요. 같은 파일을 둘에게 주지 마세요.

1. UI Agent
   - 소유: `src/index.html`, `src/styles.css`
   - 실제 업무 담당자가 바로 이해할 수 있는 반응형 운영 화면을 구현
   - 재고 선택, 출고 입력, 상태 메시지, 이력, 완료/취소 배지, 로딩·빈 상태를 시각적으로 구분
   - 큰 강의용 문구나 에이전트 말투를 쓰지 않고 제품 UI 문구를 사용
   - 접근 가능한 label, table, focus, disabled 상태를 구현
2. Interaction Agent
   - 소유: `src/app.js`
   - Architecture의 API 계약에 맞춰 조회·필터·선택·출고·전체 취소·초기화를 구현
   - 400 문자열 detail과 422 배열 detail을 모두 사용자 메시지로 변환
   - 요청 중 중복 클릭을 막고 성공 후 재고와 이력을 다시 조회
   - 완료 건에만 전체 취소 버튼을 노출

두 Agent가 공유할 CSS 계약은 다음으로 고정합니다: 메시지는 `message message--info|success|error`, 상태 배지는 `status-badge status-badge--completed|canceled`, 비활성 처리는 표준 `disabled` 속성을 사용합니다.

두 Writer가 끝난 뒤 세 번째 Browser Contract Verifier Sub-Agent를 읽기 전용으로 실행하세요. Verifier는 파일을 수정하지 않고 DOM id, API 경로, 오류·로딩·빈 상태, 완료 건만 취소 가능한지 검토하고 `python -m unittest tests.test_frontend -v`를 실행해 증거만 보고합니다.

# 검증과 로컬 commit

- 저장소 로컬 `.venv`가 없으면 `/Users/mingu/Desktop/한화/hanwha-agent-ai-day2-spec-workshop/.venv/bin/python`을 사용하세요.
- `python -m unittest tests.test_frontend -v`를 통과시키세요.
- `git diff --check`와 `git diff --name-only`로 쓰기 범위를 감사하세요.
- 통과 후 위 세 파일만 로컬 commit 하세요. commit 메시지는 `feat(frontend): complete IPS operations workspace`입니다.
- 실패를 감추기 위해 테스트를 수정하거나 TODO 문자열만 의미 없이 지우지 마세요.

완료 후 Writer/Verifier Sub-Agent별 결과, 수정 파일, 테스트 결과, 범위 감사, commit SHA를 보고하세요.
