---
name: implement-ips-mvp
description: 승인된 SPEC·Architecture·ADR·RFC를 따라 IPS WBS 출고·취소 MVP를 Worktree와 Sub-Agent로 구현·검증·기록할 때 사용한다.
---

# IPS MVP 구현 절차

업무 규칙·구조·권한은 이 파일에 없다. 아래 승인 문서가 유일한 원천이며, 이 스킬은 실행 순서만 정한다.

## 1. 읽기 (순서 고정)

1. `docs/SPEC.md` — 계약·불변조건·인수 조건·MVP 가정
2. `docs/ARCHITECTURE.md` — 계층·API 계약·파일 소유권·통합 순서
3. `docs/adr/ADR-001.md` — 검증 순서 결정의 근거
4. `docs/rfc/RFC-001.md` — 수정 가능 범위·금지·중단 조건·게이트
5. 진행할 `docs/요청사항/LOOP-*.md` 한 건

## 2. 실행

- Frontend와 Backend용 git worktree를 각각 만들고, `docs/ARCHITECTURE.md` 4장의 소유권대로 Sub-Agent에게 파일을 배타 할당한다.
- 각 Sub-Agent 프롬프트에는 담당 파일, 참조할 승인 문서 경로, RFC의 금지·중단 조건을 포함한다.
- LOOP는 한 번에 하나만 진행한다.

## 3. 검증

- `docs/rfc/RFC-001.md` 5장의 게이트 G1→G7을 순서대로 통과시킨다.
- Worktree 로컬 commit은 담당 게이트 통과 후에만, 통합·push 권한은 RFC 6장을 따른다.
- 실패 시 RFC 4장의 중단 조건에 해당하면 즉시 멈추고 사람에게 보고한다.

## 4. 기록

- 현재 LOOP의 게이트가 모두 통과하면 즉시 `CHANGELOG.md`에 기록하고 같은 LOOP 단위로 commit한 뒤 다음 LOOP로 이동한다(검증된 제품 변화만, 실패한 시도 제외).
- 실습 마지막에는 CHANGELOG 누락과 버전 표기만 정리한다.
- SPEC·Architecture는 수정하지 않는다. 가정이 틀렸다면 보고만 하고 개정은 사람 승인을 기다린다.
