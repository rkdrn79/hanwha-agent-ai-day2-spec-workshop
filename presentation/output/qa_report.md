# QA Report — IPS WBS solution brief

검수 대상: `ips_wbs_solution_brief.pptx` (16:9, 8장, 편집 가능)

## Fact

- `100 → 88 → 100`: SPEC §7, AC-08·11과 대조했습니다.
- 상태 `COMPLETED → CANCELED`: SPEC §3, AC-08·11·12와 대조했습니다.
- 실패 시 재고·이력·request_id 불변: SPEC §5, AC-09·10·12와 대조했습니다.
- 이동유형 `221/222`, `M75/M76`, `M77/M78`: SPEC §2, AC-04·13과 대조했습니다.
- `23/23`: 현재 solution 코드에서 전체 자동 테스트를 다시 실행해 23개 모두 통과했습니다.
- 범위 밖 `실제 SAP`, `로그인·권한`, `부분 취소`, `운영 DB`: SPEC §1과 대조했습니다.

## Structure

제목만 읽었을 때 다음 흐름이 이어지는지 확인했습니다.

```text
결론 → 문제 → 상태 흐름 → 불변조건 → 업무 코드 → 구현 경계 → 검증 → 다음 변경
```

각 장은 하나의 결론과 하나의 주 시각을 사용합니다. 반복 카드 그리드 대신 숫자 흐름, 상태 전이, 테스트 표, 코드 쌍, 계층 구조를 사용했습니다.

## Visual

- 원본 2일차 강연의 주황 상단 바, 흰 본문, 짙은 패널, 파란 근거 도형, 우측 페이지 번호 문법을 적용했습니다.
- 전 장을 150dpi로 렌더링하고 `contact_sheet.png`와 개별 슬라이드를 확인했습니다.
- 한글 렌더를 위해 Fontconfig 캐시를 명시적으로 갱신한 뒤 재검수했습니다.
- 텍스트 overflow 0건, 실제 겹침 0건, placeholder 0건을 확인했습니다.
- 8장 모두 잘림, 어색한 줄바꿈, 작은 핵심 글씨가 없는지 눈으로 확인했습니다.
- 학교·회사 로고는 승인된 자산이 없어 추가하지 않았습니다.

## Repeatability

내용 원천은 `presentation/outline.json`, 레이아웃 원천은 `presentation/generator/build_solution_ppt.js`입니다.

```bash
node presentation/generator/build_solution_ppt.js
```

공식 `pptx` Skill의 Office 구조 검증 결과: `All validations PASSED!`

생성 결과물을 직접 수정하지 않고 원천 파일을 수정한 뒤 다시 빌드하는 방식으로 검수했습니다.
