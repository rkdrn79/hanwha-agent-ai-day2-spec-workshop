# Claude Code 전체 제작 프롬프트

아래 블록을 Claude Code에 그대로 붙여 넣습니다.

```text
이 저장소의 .claude/skills/create-solution-ppt/SKILL.md와
.claude/skills/pptx/SKILL.md를 모두 사용해줘.

목표는 계획서가 아니라 편집 가능한 PPT 전체를 완성하는 것이다.
presentation/source_map.md, presentation/storyboard.md,
presentation/outline.json은 승인된 제작 기준선으로 취급해.

1. docs/SPEC.md, docs/ARCHITECTURE.md, ADR, RFC, tests, CHANGELOG를 읽고
   outline의 숫자·상태·이동유형·검증 결과만 원문과 대조해.
2. presentation/generator/build_solution_ppt.js를 실행해
   presentation/output/ips_wbs_solution_brief.pptx를 생성해.
3. 원본 2일차 강연의 시각 문법을 유지해:
   주황 상단 바, 흰 본문, 짙은 코드 패널, 파란 근거 도형, 우측 페이지 번호.
   반복 카드 그리드와 장식 아이콘은 쓰지 마.
4. 전 장을 PNG로 렌더링하고 접촉 시트를 만들어 실제 화면을 눈으로 검수해.
5. 겹침, 잘림, 작은 글씨, 어색한 줄바꿈, 똑같은 레이아웃 반복이 있으면
   outline.json 또는 생성 소스를 수정하고 다시 빌드해.
6. 공식 pptx Skill의 Office 구조 검증을 실행하고
   presentation/output/qa_report.md에 Fact, Structure, Visual,
   Repeatability 결과를 기록해.

계획이나 프롬프트 문서만 만들고 멈추지 마.
PPTX, contact_sheet.png, qa_report.md가 모두 준비된 뒤 완료를 보고해.
```

## 한 장만 수정할 때

```text
같은 두 Skill을 사용해줘. presentation/output의 PPTX를 직접 고치지 말고
presentation/outline.json 또는 generator 소스를 수정한 뒤 전체를 다시 생성해.
수정한 장과 앞뒤 장을 렌더링해 시각적으로 확인하고 QA 보고서도 갱신해.
```
