# Claude Code 실행 기록

Claude Code `2.1.229`로 student starter에서 문서 기준선과 IPS MVP를 만든 실행 기록입니다. 번호가 붙은 Markdown 파일은 실제 표준입력으로 전달한 **전체 프롬프트 원문**이며 축약하거나 사후 편집하지 않았습니다.

| 순서 | 프롬프트 | 역할 | 결과 |
|---|---|---|---|
| 01 | `01-document-foundation.md` | Root Architect + Requirements/Architecture Sub-Agent | SPEC·Architecture·ADR·RFC·짧은 Skill 작성 |
| 02 | `02-frontend-worktree.md` | Frontend Orchestrator + UI/Interaction/Verifier Sub-Agent | `src/index.html`, `src/styles.css`, `src/app.js` 완성 |
| 03 | `03-backend-worktree.md` | Backend Orchestrator + Domain/Service/Verifier Sub-Agent | `src/engine.py`, `src/service.py` 완성 |
| 04 | `04-integration-review.md` | Root Reviewer + Contract/UX Auditor Sub-Agent | 계약 위반 0건, 추가 코드 수정 없음 |

## Worktree와 commit

- student 기준선: `student-workshop-v2` / `68fd925`
- 문서·Skill 기준선: `claude-mvp-workshop-v2` / `cc6582e`
- Frontend Worktree: `frontend-mvp-v2` / `c720598`
- Backend Worktree: `backend-mvp-v2` / `5bb9545`
- 통합 브랜치: `claude-mvp-workshop-v2`

Claude의 비대화형 세션에서는 공유 `.venv`의 Python 실행이 승인을 요구했습니다. 두 구현 Claude는 RFC 중단 조건에 따라 테스트 미실행 상태에서 commit하지 않았고, Root Orchestrator가 같은 명령을 직접 실행해 통과를 확인한 뒤 해당 파일만 commit했습니다.

## 최종 증거

- 전체 자동 테스트: `23/23` 통과
- Skill 검증: `Skill is valid!`, 33줄
- 브라우저: WBS 필터, `100 → 88 → 100`, 중복 요청 불변, 재고 부족 불변, 전체 취소, 초기화 확인
- 반응형: 480px에서 단일 열 폼·세로형 toolbar 확인
- 콘솔 오류·경고: 0건
- 원격 push: 수행하지 않음
