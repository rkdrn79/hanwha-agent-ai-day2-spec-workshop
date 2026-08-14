# Claude Code Worktree로 완성하는 IPS MVP

한화 Agent AI 실무교육 2일차 실습용 **student starter**입니다.

이 저장소는 완성 코드를 제공하지 않습니다. 수강생은 `docs/요청사항/`의 업무 요청을 검증 가능한 SPEC으로 바꾸고, Architecture·ADR·RFC·Project Skill을 만든 뒤 Frontend와 Backend Worktree를 통해 MVP를 완성합니다.

```text
업무 요청
→ SPEC·Architecture·ADR·RFC 승인
→ 짧은 Project Skill 작성
→ Frontend / Backend Worktree
→ Worktree 내 파일 전담 Sub-Agent
→ 통합·검증·수정
→ 루프별 CHANGELOG
```

## 완주 목표

재고 담당자가 한 화면에서 재고를 선택하고 출고한 뒤 전체 취소할 수 있는 MVP를 만듭니다.

```text
재고 100 → 12 출고 → 88 → 전체 취소 → 100
```

## 시작 파일

```text
docs/
└─ 요청사항/
   ├─ README.md
   ├─ 00-업무-배경.md
   ├─ 01-MVP-요구사항.md
   ├─ LOOP-01-재고와-기본-출고.md
   ├─ LOOP-02-안전한-출고.md
   ├─ LOOP-03-전체-취소와-이동유형.md
   └─ LOOP-04-화면-통합과-회귀.md
```

요청사항은 정답 설계서가 아닙니다. 업무 상황과 완료 목표만 제공하며, 미결정 사항은 Claude Code와 찾고 사람이 승인합니다.

## 코드 구조와 소유권

```text
src/
├─ index.html      # Frontend UI Agent
├─ styles.css      # Frontend UI Agent
├─ app.js          # Frontend Interaction Agent
├─ app.py          # 제공 API 계약·정적 파일 제공
├─ data.py         # 제공 데모 데이터
├─ store.py        # 제공 메모리 저장소
├─ engine.py       # Backend Domain Agent
└─ service.py      # Backend Service Agent
```

동일 파일을 두 Agent에게 동시에 주지 않습니다. Frontend와 Backend는 `docs/ARCHITECTURE.md`에 승인된 API 요청·응답 계약을 공유합니다.

## 환경 준비

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r src/requirements.txt
```

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r src/requirements.txt
```

## Claude Code 프롬프트 예시

PPT에서 사용하는 전체 예시를 실행 순서대로 제공합니다.

```text
prompts/
├─ 01-SPEC.md
├─ 02-ARCHITECTURE.md
├─ 03-ADR.md
├─ 04-RFC.md
├─ 05-PROJECT-SKILL.md
├─ 06-FRONTEND-WORKTREE.md
├─ 07-BACKEND-WORKTREE.md
└─ 08-INTEGRATION-REVIEW.md
```

`01`부터 `05`까지는 Main 세션에서 한 번에 하나씩 실행하고 사람이 결과를 승인합니다. 기준선 commit 후 `06`과 `07`을 서로 다른 Worktree 세션에서 실행하며, 통합 뒤 `08`을 Main 세션에서 실행합니다.

프롬프트는 수강생이 직접 설계하되, 막히면 예시를 참고할 수 있습니다. 예시를 그대로 보내기 전에 현재 단계, 승인된 문서와 작업 범위를 확인합니다.

## Claude Code 사용 순서

### 1. 아직 구현하지 말고 질문하기

Claude Code에 포함할 내용:

- `docs/요청사항/` 전체와 현재 코드·테스트 조사
- 모호함, 충돌, 누락된 업무 결정만 질문으로 정리
- 파일 생성과 코드 수정은 아직 금지

### 2. 원천 문서 승인하기

구현 전에 다음을 직접 만듭니다.

```text
docs/SPEC.md
docs/ARCHITECTURE.md
docs/adr/ADR-001.md
docs/rfc/RFC-001.md
```

- SPEC: 최초 제품 계약과 인수 조건
- Architecture: 구조·API 계약·파일 소유권의 고정 원천
- ADR: 중요한 결정과 대안
- RFC: AI 허용 범위·금지·중단 조건

### 3. 짧은 Project Skill 만들기

```text
.claude/skills/implement-ips-mvp/SKILL.md
```

Skill에 업무 규칙과 Architecture를 복사하지 않습니다. 승인 문서를 읽고, Worktree를 나누고, 통합·검증·기록하는 실행 절차만 작성합니다.

### 4. Worktree와 Sub-Agent로 구현하기

```text
Root Orchestrator
├─ Frontend Worktree
│  ├─ UI Agent: index.html, styles.css
│  ├─ Interaction Agent: app.js
│  └─ Browser Verifier: 읽기 전용
└─ Backend Worktree
   ├─ Domain Agent: engine.py
   ├─ Service Agent: service.py
   └─ API Verifier: 읽기 전용
```

Worktree 내 로컬 commit은 통합 증거를 남기기 위해 허용하지만, 원격 push는 Root Orchestrator만 수행합니다.

### 5. 요청 루프를 하나씩 완료하기

`docs/요청사항/LOOP-*.md`를 순서대로 진행합니다.

```text
현재 LOOP 읽기
→ 영향 파일 확인
→ Agent 위임
→ 대상 테스트
→ 전체 회귀 테스트
→ 화면 검증
→ CHANGELOG 작성
→ LOOP commit
→ 다음 LOOP
```

CHANGELOG는 실습 마지막에 몰아서 쓰지 않습니다. 각 LOOP가 검증을 통과한 직후 **검증된 제품 변화**를 기록하고 같은 단위로 commit합니다. 실패한 시도나 예정 작업은 남기지 않으며, 실습 마지막에는 누락과 버전 표기만 확인합니다.

## 검증

```bash
python -m unittest discover -s tests -v
python src/app.py
```

브라우저에서 `http://127.0.0.1:8000`을 열고 정상·오류·취소 흐름을 확인합니다.

Student starter의 첫 실행은 실패하는 것이 정상입니다. 재고 조회와 정적 화면 계약만 제공되며, 출고·취소 규칙과 화면 연동은 TODO 상태입니다. 이 실패 목록이 앞으로 통과시킬 작업 목록입니다.

## 완료 조건

- [ ] SPEC·Architecture·ADR·RFC가 승인되었습니다.
- [ ] 원천 문서를 참조하는 짧은 Project Skill이 있습니다.
- [ ] Frontend와 Backend가 서로 다른 Worktree에서 작업했습니다.
- [ ] Worktree 내 Sub-Agent가 소유권이 다른 파일을 담당했습니다.
- [ ] 전체 자동 테스트와 브라우저 테스트가 통과합니다.
- [ ] `100 → 88 → 100`을 확인했습니다.
- [ ] 각 LOOP를 닫을 때 검증된 변화가 CHANGELOG와 commit에 남았습니다.
