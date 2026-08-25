# Reverse Spec workspace rules

이 폴더에서는 `.claude/skills/office-to-spec/SKILL.md`를 기본 실행 계약으로 사용한다.

- 입력 PPT와 Excel을 수정하지 않는다.
- `pptx`와 `xlsx` Skill을 함께 사용한다.
- SPEC을 쓰기 전에 source inventory와 evidence ledger를 만든다.
- 모든 확정 요구사항에 `PPT:S번호` 또는 `XLSX:시트!범위`를 연결한다.
- 충돌·모호함·추정은 `OPEN_QUESTIONS.md`로 분리한다.
- 조회 7일/30일, 취소 2시간/4시간, 예약 목적 필수 여부 중 하나를 자동 선택하지 않는다.
- 측정 불가능한 “빠르게”를 임의의 NFR로 바꾸지 않는다.
- `reverse-spec/output/`에 결과를 저장한다.
- validator가 passed일 때만 완료를 보고한다.
