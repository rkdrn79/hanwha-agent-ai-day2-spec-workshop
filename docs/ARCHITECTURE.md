# ARCHITECTURE: IPS WBS 출고·취소 MVP

이 문서는 제품 구조의 **유일한 원천**입니다. 계층·의존 방향·API 계약·파일 소유권·통합 순서는 여기서 정의한 내용만 유효하며, 다른 문서는 이 문서를 참조만 합니다. 업무 규칙과 인수 조건은 `docs/SPEC.md`, AI 권한과 게이트는 `docs/rfc/RFC-001.md`를 따릅니다.

## 1. 계층과 의존 방향

```text
Frontend (index.html / styles.css / app.js)
    │  HTTP (아래 2장의 API 계약만 공유)
    ▼
app.py      ─ API 라우팅, 요청 모델, IpsError→400 변환, 정적 파일  [제공·읽기 전용]
    ▼
service.py  ─ 유스케이스 조정: 검증 순서와 오류 변환               [Backend Service Agent]
   ▼    ▼
engine.py  store.py
 순수 규칙   메모리 저장소(무검증)                                  [engine: Backend Domain Agent / store: 제공·읽기 전용]
              ▼
           data.py ─ 데모 재고 3건                                  [제공·읽기 전용]
```

의존 규칙:

- 화살표 방향으로만 import한다. `engine`은 아무것도 import하지 않는 순수 계층이다.
- `app.py`는 `store`를 직접 호출하지 않는다. 저장소 접근은 항상 `service`를 거친다.
- 테스트는 `sys.path`에 `src/`를 넣고 평면 import(`import engine`)를 쓴다. **모듈 이름·위치·패키지 구조를 바꾸면 전체 테스트가 깨지므로 금지**한다.
- `store`는 검증하지 않는다. 중복·재고 부족·상태 검사는 전부 `service`가 `engine` 규칙으로 **저장소 변경 전에** 끝낸다(ADR-001).

### 모듈별 책임과 구현 상태

| 모듈 | 책임 | 상태 |
|---|---|---|
| `app.py` | 라우팅, `ShipmentRequest`/`CancelRequest` 모델, `_run`의 `IpsError`→400 변환 | 제공 완료 |
| `data.py` | 데모 재고 3건 (IM24-001/100, R2-00-100/20, R2-01-200/8) | 제공 완료 |
| `store.py` | 재고·출고 dict 저장, `request_id` 집합, deepcopy 반환, 리셋 | 제공 완료 |
| `engine.py` | 입력 검증, 이동유형 판정, 재고·취소 상태 규칙, `IpsError` | **TODO 5개 함수** |
| `service.py` | 출고·취소 유스케이스: 검증 순서 조정, store 예외→`IpsError` 변환 | **TODO 2개 함수** |
| `index.html`/`styles.css` | 화면 구조, 상태·배지·로딩·반응형 표현 | 구조 제공, 스타일 TODO |
| `app.js` | API 연동, 상태 표시, 선택·출고·취소·초기화 동작 | **TODO 7개 함수** |

## 2. API 계약

`service` 함수의 파라미터명이 곧 API 필드명이다(`**request.model_dump()` 호출). 이름 변경 금지.

| 메서드·경로 | 요청 | 성공 응답(200) |
|---|---|---|
| `GET /api/health` | — | `{"status": "ok"}` |
| `GET /api/inventory?wbs=` | 쿼리 `wbs` 선택(정확 일치 필터) | `{"inventory": [재고 항목...]}` |
| `POST /api/shipments` | `{request_id, material_code, plant, storage_location, wbs, quantity(int), user_id}` 전부 필수 | 출고 레코드(래핑 없음) |
| `GET /api/shipments` | — | `{"shipments": [레코드...]}` 최신 우선 |
| `GET /api/shipments/{id}` | 경로 `id: int` | 출고 레코드(래핑 없음) |
| `POST /api/shipments/{id}/cancel` | `{"user_id": str}` 필수 | 취소된 레코드(래핑 없음) |
| `POST /api/demo/reset` | — | `{"status": "reset"}` |
| `GET /`, `/styles.css`, `/app.js` | — | 정적 파일 |

오류 계약:

- 업무 규칙 위반(`IpsError`) → `400` + `{"detail": "<문자열>"}`. 문구는 SPEC 6장이 고정.
- 요청 형식 오류(필드 누락·타입 불일치) → `422` + `detail`이 **객체 배열**. Frontend `api()` 헬퍼는 `detail`이 문자열이 아닐 때를 반드시 분기 처리한다.
- 목록 응답(`inventory`/`shipments`)만 키로 래핑되고 단건 응답은 평면 dict다. 공통 헬퍼에서 일괄 언래핑하지 않는다.

### 출고 레코드 필드 (전 필드 계약)

`shipment_id`(int), `request_id`, `material_code`, `plant`, `storage_location`, `wbs`, `quantity`, `user_id`, `unit`, `movement_type`, `cancel_movement_type`(취소 전 `null`), `status`(`COMPLETED`/`CANCELED`), `stock_after`(해당 재고 항목의 트랜잭션 직후 수량 — 현재 재고 아님), `completed_at`, `canceled_at`(취소 전 `null`), `canceled_by`(취소 전 `null`).

`material_name`은 레코드에 **없다**. 이력 화면의 자재 표기는 자재코드 기준이며, 자재명이 필요하면 Frontend가 `/api/inventory` 결과와 조인한다.

### Backend 내부 처리 순서 (service.create_shipment)

실패 시 무변경(SPEC 5장)을 보장하기 위해 아래 순서를 고정한다. `store.complete_shipment`/`store.cancel_shipment`는 마지막에 단 한 번 호출한다.

1. `engine.validate_outbound_input(...)` → 정규화 payload(7필드 dict)
2. `store.has_request_id(...)` → 중복이면 `IpsError`
3. `store.get_inventory(...)` → `InventoryNotFoundError`를 `IpsError`(일치하는 재고 없음)로 변환
4. `engine.validate_available_stock(가용, 요청)`
5. `engine.movement_types(wbs)` → `(출고, 취소)` 쌍 중 출고 코드 사용
6. `store.complete_shipment(payload, 출고코드)`

`service.cancel_shipment`도 같은 원칙: `_get_shipment` → `engine.validate_cancel_status(status)` → `engine.movement_types(wbs)`의 취소 코드 → `store.cancel_shipment`. `store.cancel_shipment`는 상태를 검사하지 않고 무조건 재고를 되돌리므로, 검증 없이 호출하면 재고가 이중 증가한다.

## 3. Frontend 계약

- 필수 DOM id(테스트 고정, 큰따옴표 유지): `inventoryBody`, `wbsFilter`, `shipmentForm`, `submitButton`, `message`, `shipmentBody`, `resetButton`. 그 외 제공 id(`filterButton`, `requestId`, `userId`, `materialCode`, `plant`, `storageLocation`, `wbs`, `quantity`)도 `app.js`가 참조하므로 유지한다.
- 상태 표시: `setMessage(text, kind)`의 `kind`는 `success`/`error`/`info` 3종. UI Agent는 이 3종에 대응하는 CSS 클래스와 상태 배지(`COMPLETED`/`CANCELED`) 클래스를 `styles.css`에 정의하고, Interaction Agent는 **그 클래스명을 그대로** 사용한다. 클래스명 목록은 Frontend Worktree 내 두 Agent가 합의해 통합 전에 고정한다.
- 동작 규칙: 최초 진입과 출고·취소·초기화 성공 후 `refresh()`로 재고·이력을 다시 읽는다(`stock_after`를 현재 재고로 표시하지 않는다). 요청 중에는 `setBusy(true)`로 버튼을 잠근다. 초기화 후에는 readonly 폼 필드를 비우고 기본값을 되돌린다. `shipment_id`는 초기화 시 재사용되므로 캐시하지 않는다.
- 완료 건에만 취소 버튼을 노출하고, 취소 요청 body에 `#userId` 값을 담는다.

## 4. Worktree와 Sub-Agent 파일 소유권

```text
Root Orchestrator (원격 push·CHANGELOG·문서 승인 담당)
├─ Frontend Worktree
│  ├─ UI Agent          : src/index.html, src/styles.css
│  ├─ Interaction Agent : src/app.js
│  └─ Browser Verifier  : 읽기 전용 (화면 검증만)
└─ Backend Worktree
   ├─ Domain Agent      : src/engine.py
   ├─ Service Agent     : src/service.py
   └─ API Verifier      : 읽기 전용 (테스트 실행·API 검증만)
```

소유권 규칙:

- 한 파일의 쓰기 권한은 정확히 한 Agent에게만 있다. 동시 부여 금지.
- `src/app.py`, `src/data.py`, `src/store.py`, `src/requirements.txt`, `tests/**`, `README.md`, `docs/요청사항/**`는 **모든 Agent에게 읽기 전용**이다. 테스트가 계약의 판정 기준이므로 테스트 수정은 곧 계약 변경이며, 사람 승인 없이는 불가하다(RFC-001).
- `CHANGELOG.md`와 `docs/**`(요청사항 제외)는 Root Orchestrator만 쓴다.
- Frontend와 Backend는 서로의 파일을 열람할 수 있으나 수정할 수 없고, 오직 2·3장의 계약으로만 협업한다.

## 5. 통합 순서

1. **Backend 선행**: Domain Agent가 `engine.py` 규칙을 완성 → `test_engine.py` 통과 → Service Agent가 `service.py` 유스케이스를 완성 → `test_service.py`·`test_api.py` 통과. Backend Worktree에서 로컬 commit.
2. **Frontend 병행**: UI Agent가 스타일·상태 클래스를 완성하고 Interaction Agent가 `app.js`를 API 계약(2장)에 맞춰 완성 → `test_frontend.py` 통과. Backend 완성 전에는 실서버 대신 계약 문서를 기준으로 작업한다. Frontend Worktree에서 로컬 commit.
3. **통합**: Root Orchestrator가 두 Worktree를 본 브랜치로 통합 → 전체 회귀(`python -m unittest discover -s tests -v`) → `python src/app.py` 실행 후 브라우저 스모크(SPEC 7장) → RFC 게이트(읽기 전용 파일 diff 없음) 확인.
4. **기록**: 검증을 통과한 변화만 `CHANGELOG.md`에 LOOP 단위로 기록하고, Root Orchestrator만 원격 push를 수행한다(이번 실습에서는 사람 승인 후).

## 6. 알려진 통합 위험

- `store`는 무방비 계층이다: 없는 키 접근은 `KeyError`→500으로 새므로, service가 모든 예외를 `IpsError`로 먼저 변환해야 한다.
- WBS 비대칭: 이동유형 판정은 대소문자 무시, 재고 조회는 정확 일치(SPEC 8장 가정 1·2). 입력 정규화에서 대소문자를 바꾸지 않는다.
- 오류 `detail` 형태가 400(문자열)/422(배열)로 갈린다. Frontend 공통 처리에서 타입 분기 필수.
- 상태 문자열은 `engine` 상수와 `store` 리터럴에 이중 정의되어 있다. 값 변경 금지.
- 데모 초기화는 `{"status": "reset"}`만 반환한다. 화면 복구는 Frontend 책임이다.
