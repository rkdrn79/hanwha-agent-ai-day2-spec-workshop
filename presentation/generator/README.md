# PPT 재생성

Claude Code의 공식 `pptx` Skill 환경에서는 PptxGenJS가 준비되어 있으므로 다음 명령만 실행합니다.

```bash
node presentation/generator/build_solution_ppt.js
```

일반 로컬 환경에서 모듈을 찾지 못하면 이 폴더에서 `npm install` 후 다시 실행합니다.

```bash
cd presentation/generator
npm install
npm run build
```

내용 수정은 `presentation/outline.json`, 레이아웃 수정은 `build_solution_ppt.js`에서 합니다. 생성된 PPTX를 직접 패치하지 않습니다.

결과:

```text
presentation/output/ips_wbs_solution_brief.pptx
```
