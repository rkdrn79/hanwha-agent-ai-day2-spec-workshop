# IPS WBS 출고·취소 MVP

제공된 구매시스템(IPS) 입출고 기능개선 자료의 핵심 흐름을 2시간 교육용으로 축소한 로컬 웹 앱입니다.

## 구현 범위

- WBS별 재고 조회
- 출고 즉시 처리와 재고 차감
- WBS 접두사별 이동유형 결정
- 출고 완료 건 전체 취소와 재고 원복
- 재고 부족, 중복 요청, 중복 취소 차단
- 메모리 기반 출고 이력

실제 SAP BAPI, 전자결재, 메일, 자동 동기화, 인증, 데이터베이스는 제외합니다.

## 실행

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r src/requirements.txt
python src/app.py
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다.

## 테스트

```bash
python -m unittest discover -s tests -v
```

업무 규칙의 기준은 `docs/IPS MVP 구현스펙.md`입니다.
