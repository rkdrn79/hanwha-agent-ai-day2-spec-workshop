# Evidence rules

## 원본 위치 표기

- PPT 본문: `PPT:S3`
- PPT 발표자 노트: `PPT:S3:NOTES`
- Excel 행: `XLSX:버튼이벤트!A5:J5`
- Excel 셀: `XLSX:화면항목정의!E14`
- Excel 수식 또는 검증 규칙: 해당 셀·범위 뒤에 `(formula)` 또는 `(validation)` 표기

한 요구사항이 여러 곳에 근거하면 세미콜론으로 모두 기록한다.

## 증거 분류

| 분류 | SPEC 처리 | 예시 |
|---|---|---|
| `confirmed` | 요구사항 또는 인수 조건으로 사용 가능 | PPT와 Excel 모두 반려 사유를 조건부 필수로 명시 |
| `conflict` | `OPEN_QUESTIONS.md`로 이동 | 기본 조회 기간이 PPT 7일, Excel 30일 |
| `ambiguous` | 빠진 조건을 질문으로 작성 | “빠르게”라고만 적혀 측정 기준이 없음 |
| `candidate` | 아이디어·추정으로만 보존 | 취소 알림을 이메일 또는 앱으로 보낼 수 있음 |
| `out-of-scope` | SPEC의 범위 밖에 명시 | 반복 예약과 출입 QR은 MVP에서 제외 |

## 충돌 판정

다음 중 하나면 충돌이다.

- 같은 행위의 허용/금지가 다름
- 동일 필드의 필수 여부, 형식, 기본값이 다름
- 상태·코드·수량·기간·오류 처리 값이 다름
- 한 파일은 구현 범위, 다른 파일은 범위 밖으로 명시

충돌이 아닌 경우:

- PPT는 목적을, Excel은 상세 조건을 설명하며 서로 양립 가능
- 한 파일이 다른 파일에 없는 추가 세부사항을 제공하고 기존 내용과 모순되지 않음
- 예시 값이 명백히 예시로 표시되어 있음

## 요구사항 문장 규칙

- 행위 주체와 시스템 반응을 명시한다.
- 조건과 실패 결과를 포함한다.
- 수치와 코드는 원문 그대로 사용한다.
- 검증할 수 없는 형용사를 제거한다.
- 한 ID에는 한 가지 의무만 둔다.

나쁜 예:

```text
시스템은 예약을 빠르고 편리하게 처리해야 한다.
```

좋은 예:

```text
FR-004. 참석 인원이 회의실 정원을 초과하면 시스템은 예약을 생성하지 않고 입력값을 유지해야 한다.
```

## 추적표 최소 열

```text
requirement_id,requirement_type,summary,source,status,verification,notes
```

- `status`: `confirmed`, `conflict`, `ambiguous`, `candidate`, `out-of-scope`
- 확정 요구사항의 `source`와 `verification`은 비어 있을 수 없다.
- 충돌·모호함은 요구사항 ID를 부여하지 않거나 `OPEN-*` ID를 사용한다.
