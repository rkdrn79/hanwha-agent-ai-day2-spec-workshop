# 제공된 애플리케이션 뼈대

이 폴더에는 IPS WBS 출고·취소 MVP의 화면, API, 데모 데이터와 메모리 저장소가 있습니다.

- `app.py`: FastAPI 경로와 화면 연결
- `data.py`: 데모 재고 3건
- `store.py`: 메모리 기반 재고·출고 저장소
- `index.html`: 재고 조회·출고·취소 단일 화면
- `engine.py`: 수강생 구현 대상인 순수 업무 규칙
- `service.py`: 수강생 구현 대상인 출고·취소 흐름

구현 전에 수강생이 직접 승인한 `docs/SPEC.md`, `docs/ARCHITECTURE.md`, ADR과 RFC를 기준으로 사용합니다.
