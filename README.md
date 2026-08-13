# Claude Code로 완성하는 IPS WBS 출고·취소 MVP

한화 Agent AI 실무교육 2일차 실습용 **naive starter**입니다.

이 저장소에는 화면, 데모 데이터, API 뼈대, 메모리 저장소, 실패하는 테스트만 들어 있습니다. 완성된 SPEC·Architecture·ADR·RFC·Skill과 핵심 업무 규칙은 제공하지 않습니다.

수강생은 Claude Code와 함께 다음 흐름을 직접 수행합니다.

```text
업무 요청 읽기
→ SPEC 작성·승인
→ Architecture 원천 문서 작성·승인
→ ADR·RFC 작성·승인
→ 짧은 Claude Code Skill 작성
→ Worktree로 격리한 여러 Agent에 구현 위임
→ 통합·테스트·수정
→ CHANGELOG 기록
```

## 완주 목표

재고 담당자가 한 화면에서 다음 흐름을 끝까지 수행할 수 있는 MVP를 만듭니다.

```text
WBS 재고 조회 → 출고·재고 차감 → 완료 출고 전체 취소·재고 원복
```

최종 시연에서는 재고 `100`에서 `12`를 출고해 `88`이 되고, 전체 취소 후 다시 `100`이 되는지 확인합니다.

## 시작 상태

```text
JB/
├── README.md
├── CHANGELOG.md                  # 실습 마지막에 작성
├── requirements/
│   └── 업무요청.md               # 유일한 최초 요구사항
├── docs/                         # 수강생이 설계 문서를 생성할 공간
├── .claude/
│   └── skills/                   # 수강생이 Project Skill을 생성할 공간
├── src/
│   ├── app.py                    # 제공: API와 화면 연결
│   ├── data.py                   # 제공: 데모 재고
│   ├── engine.py                 # 실습: 순수 업무 규칙
│   ├── service.py                # 실습: 출고·취소 흐름
│   ├── store.py                  # 제공: 메모리 저장소
│   └── index.html                # 제공: 단일 화면
└── tests/                        # 제공: 수정하지 않는 검증 기준
```

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

Claude Code가 이 저장소를 신뢰하도록 프로젝트 루트에서 한 번 실행합니다.

```bash
claude
```

## 실습 규칙

### 제공 파일

다음 파일은 읽을 수 있지만 수정하지 않습니다.

- `requirements/업무요청.md`
- `src/app.py`, `src/data.py`, `src/store.py`, `src/index.html`
- `tests/**`
- `src/requirements.txt`

### 수강생 산출물

다음 파일은 실습 중 직접 만듭니다. 문서 내용이나 Skill은 미리 제공되지 않습니다.

```text
docs/SPEC.md
docs/ARCHITECTURE.md
docs/adr/ADR-001.md
docs/rfc/RFC-001.md
.claude/skills/implement-ips-mvp/SKILL.md
```

구현 단계에서 수정할 후보 파일은 `src/engine.py`, `src/service.py`입니다. 정확한 허용 범위는 수강생이 작성하고 승인한 RFC로 결정합니다.

## 실습 순서

### 1. 질문만 찾기

Claude Code에 `requirements/업무요청.md`만 읽게 합니다. 아직 문서나 코드를 만들지 않고, 구현 전에 사람이 결정해야 할 질문을 찾습니다.

### 2. SPEC 작성·승인

강사가 제공하는 업무 결정을 반영해 `docs/SPEC.md`를 작성합니다. 기능 범위, 데이터, 상태, 정상·오류 규칙, 숫자로 판정할 수 있는 인수 조건을 고정합니다.

### 3. Architecture 원천 문서 작성·승인

현재 코드 뼈대를 조사하고 `docs/ARCHITECTURE.md`를 작성합니다. 레이어별 책임, 의존 방향, 공개 함수 계약, 파일 소유권, 금지되는 구조를 명시합니다.

### 4. ADR과 RFC 작성·승인

- ADR에는 중요한 설계 결정과 선택하지 않은 대안, 감수할 비용을 기록합니다.
- RFC에는 이번 AI 작업의 허용 파일, 읽기 전용 파일, 금지 작업, 중단 조건, 검증 명령을 기록합니다.

승인 전까지 핵심 코드를 구현하지 않습니다.

### 5. 짧은 Claude Code Skill 작성

Project Skill은 다음 위치에 직접 만듭니다.

```text
.claude/skills/implement-ips-mvp/SKILL.md
```

Skill에 업무 규칙이나 아키텍처를 복사하지 않습니다. 승인된 원천 문서를 읽고, 충돌을 검사하고, Worktree로 격리된 Agent에게 파일 소유권을 나누고, 통합·검증·보고하도록 하는 실행 순서만 둡니다.

완성 후 Claude Code에서 직접 실행합니다.

```text
/implement-ips-mvp
```

### 6. Worktree·Multi-Agent 구현

Skill을 실행할 때 Claude에게 다음을 요구합니다.

- 승인된 문서가 없거나 충돌하면 구현 전에 중단
- 독립 작업을 여러 Agent에 위임
- 작성 Agent마다 별도 Worktree 사용
- Agent별 파일 소유권 고정
- 테스트와 기준 문서 수정 금지
- 통합 전에 각 Agent의 변경 파일과 테스트 결과 보고

Claude Code의 Worktree는 별도 체크아웃에서 실행되며 기본적으로 `.claude/worktrees/` 아래에 생성됩니다. 같은 브랜치를 여러 Worktree에 동시에 체크아웃하지 않습니다.

### 7. 검증·수정

```bash
python -m unittest discover -s tests -v
```

초기 상태에서 실패하는 것은 정상입니다. 구현 후에는 테스트를 지우거나 기대값을 바꾸지 않고, 실패를 SPEC의 인수 조건에 연결해 원인을 수정합니다.

화면 실행:

```bash
python src/app.py
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다.

### 8. 실제 변경 기록

전체 테스트와 화면 검증이 끝난 후에만 `CHANGELOG.md`를 작성합니다. 계획은 RFC, 설계 선택은 ADR, 제품 계약은 SPEC에 남기고 CHANGELOG에는 검증된 실제 변경만 기록합니다.

## 완료 조건

- [ ] 승인된 SPEC과 Architecture가 있습니다.
- [ ] Architecture의 중요한 선택을 설명하는 ADR이 있습니다.
- [ ] AI 변경 범위를 강제하는 RFC가 있습니다.
- [ ] 원천 문서를 참조하는 짧은 Claude Code Skill이 있습니다.
- [ ] 여러 Agent가 Worktree에서 분리된 파일을 구현했습니다.
- [ ] 허용 범위 밖 파일 변경이 없습니다.
- [ ] 전체 테스트가 통과합니다.
- [ ] 화면에서 `100 → 88 → 100`을 확인했습니다.
- [ ] 검증된 실제 변경을 CHANGELOG에 기록했습니다.

## 참고 문서

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Worktrees](https://code.claude.com/docs/en/worktrees)
- [Claude Code Parallel Agents](https://code.claude.com/docs/en/agents)
