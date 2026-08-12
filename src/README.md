# 사내추첨 MVP

제공된 사내추첨시스템의 핵심 업무 흐름을 교육용으로 축소한 로컬 웹 MVP입니다.

## 기능

- 참여자 이름 직접 입력
- 앞뒤 공백, 빈 줄, 동일 이름 중복 제거
- 당첨자 수 하한·상한 검증
- 중복 없는 무작위 추첨
- 테스트 시드를 사용한 재현 가능한 검증
- 결과 요약과 메모리 기반 최근 이력

인증, 이벤트 기간 관리, 파일 업로드, 블록체인 연계, 데이터베이스는 교육 MVP 범위에서 제외합니다.

## 자동 테스트

프로젝트 최상위 폴더에서 실행합니다.

```bash
python -m unittest discover -s tests -v
```

## 화면 실행

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r src/requirements.txt
python src/app.py
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다.

## 파일 역할

| 파일 | 역할 |
|---|---|
| `app.py` | API와 화면 제공 |
| `engine.py` | 입력 정리, 검증, 추첨 규칙 |
| `store.py` | 현재 실행 중 최근 추첨 이력 |
| `data.py` | 데모 참여자와 제한값 |
| `index.html` | 단일 사용자 화면 |
| `requirements.txt` | 실행·테스트 의존성 |

업무 규칙의 기준은 `docs/사내추첨 MVP 구현스펙.md`입니다.
