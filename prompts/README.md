# Claude Code 프롬프트 예시

이 폴더는 정답 문서나 완성 코드를 제공하지 않습니다. 수강생이 직접 작성할 프롬프트에 어떤 역할·입력·범위·검증 조건이 필요한지 보여주는 실행 예시입니다.

## 실행 순서

1. Main 세션에서 `01-SPEC.md`를 실행합니다. 첫 응답의 질문에 사람이 답한 뒤 같은 세션에서 SPEC을 완성합니다.
2. `02-ARCHITECTURE.md`, `03-ADR.md`, `04-RFC.md`, `05-PROJECT-SKILL.md`를 순서대로 실행합니다.
3. 각 단계의 결과를 사람이 검토하고 승인한 뒤 다음 프롬프트로 이동합니다.
4. 문서와 Skill을 기준선 commit으로 남깁니다.
5. Frontend Worktree에서는 `06-FRONTEND-WORKTREE.md`, Backend Worktree에서는 `07-BACKEND-WORKTREE.md`를 실행합니다.
6. 두 결과를 Main에 통합한 뒤 `08-INTEGRATION-REVIEW.md`를 실행합니다.

## 문서별 역할

- SPEC: 최초 제품 계약과 인수 조건의 기준선
- Architecture: 계층·API 계약·파일 소유권의 원천
- ADR: 중요한 설계 결정과 선택 이유
- RFC: AI가 수정할 수 있는 범위와 금지·중단 조건
- CHANGELOG: 검증을 통과한 실제 변경 이력
- Project Skill: 승인 문서를 읽고 구현·검증하는 짧은 실행 절차

프롬프트를 보내기 전에 현재 브랜치, Worktree, 진행할 LOOP와 쓰기 허용 파일을 확인합니다.
