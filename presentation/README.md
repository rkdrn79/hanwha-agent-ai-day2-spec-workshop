# Project → PowerPoint 예제

완성된 프로젝트의 문서와 테스트를 근거로 편집 가능한 발표자료를 만듭니다.

범용 Skill에는 장수·경로·색상을 고정하지 않습니다. 이 예제의 조건은 [`BRIEF.md`](BRIEF.md)에 있습니다.

사용할 Skill:

- `create-solution-ppt`: 발표 근거와 이야기 순서를 결정
- `pptx`: PowerPoint 생성·렌더링·구조 검증

Brief가 지정한 비브랜드 레퍼런스를 확인하되 로고나 기존 문구를 복사하지 않고
주황 표지·흰 본문·남색 증거 영역의 리듬만 재현합니다.

작업 중간 파일은 `work/`, 최종 파일은 `output/`에 저장합니다.

```text
presentation/
├─ work/
│  ├─ source_map.md
│  ├─ storyboard.md
│  ├─ outline.json
│  ├─ design_contract.md
│  └─ 생성 소스
└─ output/
   ├─ ips_wbs_solution_brief.pptx
   ├─ contact_sheet.png
   └─ qa_report.md
```

실행 프롬프트는 루트 [`README.md`](../README.md)의 `3. Project → PowerPoint`를 사용합니다.

다른 프로젝트에서는 `create-solution-ppt`와 `pptx` Skill을 그대로 복사하고
`BRIEF.md`의 프로젝트 루트·청중·발표 시간·장수·스타일·출력 경로만 바꿉니다.
