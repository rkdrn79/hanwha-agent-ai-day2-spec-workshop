# 역할

당신은 이 저장소의 Root Architect입니다. 지금은 구현 단계가 아닙니다. `docs/요청사항/`에서 출발해 개발 전 승인할 원천 문서와 짧은 Claude Project Skill만 작성하세요.

# 먼저 조사할 것

1. `docs/요청사항/` 전체, 루트 `README.md`, `src/`, `tests/`를 읽으세요.
2. Agent 도구를 사용해 서로 독립적인 읽기 전용 Sub-Agent 두 명을 병렬로 실행하세요.
   - Requirements Analyst: 요청사항·테스트에서 업무 규칙, 모호함, 인수 조건을 추출
   - Architecture Critic: 현재 코드 경계, API 계약, Frontend/Backend 파일 소유권, 통합 위험을 검토
3. 두 결과와 직접 조사 결과를 비교한 뒤 문서를 작성하세요.

# 작성할 파일

- `docs/SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/adr/ADR-001.md`
- `docs/rfc/RFC-001.md`
- `.claude/skills/implement-ips-mvp/SKILL.md`

# 문서 원칙

- SPEC은 최초 제품 계약입니다. 범위, 용어, 상태, 업무 불변조건, 오류 후 불변조건, API 관찰 결과, 검증 가능한 AC를 고정하세요. 구현 중 변경 이력을 SPEC에 덧붙이지 말고 `CHANGELOG.md`로 분리한다고 명시하세요.
- Architecture는 제품 구조의 유일한 원천 문서입니다. 계층, 의존 방향, API 요청·응답, Frontend/Backend Worktree, 각 Sub-Agent의 파일 소유권, 통합 순서를 명확히 하세요.
- ADR은 이번 MVP의 핵심 결정 한 건을 맥락·결정·대안·결과로 기록하세요.
- RFC는 AI가 수정 가능한 파일, 읽기 전용 파일, 금지 작업, 중단 조건, 검증 게이트, 로컬 commit과 원격 push 권한을 강하게 규제하세요.
- 이동유형 `221/222`, `M75/M76`, `M77/M78`은 숫자 자체가 아니라 어떤 업무 유형의 출고/취소 코드인지 설명하세요.
- 요청사항과 테스트로 결정할 수 없는 내용은 숨기지 말고 `MVP 가정`으로 분리하세요.
- 문장은 수강생이 읽는 제품 문서처럼 쓰고, 강의 대본이나 분 단위 진행표를 넣지 마세요.

# Skill 원칙

- YAML frontmatter에 `name`과 `description`을 포함하세요.
- 본문은 40줄 이내로 유지하세요.
- 업무 규칙이나 Architecture 내용을 복사하지 말고, 위 승인 문서를 읽는 순서와 Worktree/Sub-Agent 실행, 검증, CHANGELOG 기록만 행동으로 정의하세요.
- 원천 문서를 바꾸면 Skill을 고치지 않아도 되도록 상대 경로 참조를 사용하세요.

# 절대 금지

- `src/**`, `tests/**`, `README.md`, `CHANGELOG.md`, `docs/요청사항/**`, 이 프롬프트 로그를 수정하지 마세요.
- 아직 코드를 구현하거나 테스트를 통과시키지 마세요.
- git commit, git push를 하지 마세요.

완료 후 사용한 Sub-Agent와 조사 결과, 작성 파일, 명시한 MVP 가정, 코드 미수정 여부를 짧게 보고하세요.
