# Reverse Spec workspace rules

이 폴더에서는 `.claude/skills/office-to-spec/SKILL.md`를 기본 실행 계약으로 사용한다.

- `reverse-spec/BRIEF.md`를 이번 프로젝트의 입력·문서 프로필·연결 키·출력 설정으로 사용한다.
- 입력 PPT와 Excel을 수정하지 않는다.
- `pptx`와 `xlsx` Skill을 함께 사용한다.
- SPEC을 쓰기 전에 source inventory와 evidence ledger를 만든다.
- PPT는 `PPTX:파일명#S번호:B블록`·`PPTX:파일명#S번호:T표-R행`·`PPTX:파일명#S번호:NOTES` 단위로 추적한다.
- Excel은 `XLSX:파일명#시트!범위`와 수식·데이터 검증 표시를 연결한다.
- evidence ledger의 모든 행을 분류하고 빈 classification을 남기지 않는다.
- 충돌·모호함·추정은 `OPEN_QUESTIONS.md`로 분리한다.
- 원본끼리 충돌하는 값이나 필수 여부 중 하나를 자동 선택하지 않는다.
- 측정 불가능한 표현을 임의의 NFR로 바꾸지 않는다.
- 모든 FR을 Given/When/Then AC에 연결한다.
- `reverse-spec/output/`에 결과를 저장한다.
- validator가 passed일 때만 완료를 보고한다.
