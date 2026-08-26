#!/usr/bin/env python3
"""Check that the reusable workflows and included examples are ready to use."""

from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
checks: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    checks.append(message)


def check_files() -> None:
    required = [
        "README.md",
        "assets/workshop-flow.png",
        "assets/workshop-flow.excalidraw",
        "assets/create-solution-ppt-flow.png",
        "assets/create-solution-ppt-flow.excalidraw",
        "assets/office-to-spec-flow.png",
        "assets/office-to-spec-flow.excalidraw",
        "presentation/BRIEF.md",
        "reverse-spec/BRIEF.md",
        ".claude/skills/create-solution-ppt/SKILL.md",
        ".claude/skills/create-solution-ppt/references/brief-template.md",
        ".claude/skills/create-solution-ppt/references/design-contract.md",
        ".claude/skills/create-solution-ppt/assets/lecture-style-reference.png",
        ".claude/skills/office-to-spec/SKILL.md",
        ".claude/skills/office-to-spec/references/brief-template.md",
        ".claude/skills/office-to-spec/references/document-profiles.md",
        ".claude/skills/office-to-spec/tests/test_scripts.py",
        ".claude/skills/pptx/SKILL.md",
        ".claude/skills/xlsx/SKILL.md",
        "reverse-spec/input/roomflow_screen_definition.pptx",
        "reverse-spec/input/roomflow_function_definition.xlsx",
        "presentation/output/.gitkeep",
        "reverse-spec/output/.gitkeep",
    ]
    missing = [item for item in required if not (ROOT / item).is_file()]
    require(not missing, "필수 Workflow·예제 파일이 모두 있음")

    excluded = [
        "instructor",
        ".claude/skills/implement-ips-mvp",
        "presentation/generator",
        "reverse-spec/generator",
        "reverse-spec/expected",
    ]
    present = [item for item in excluded if (ROOT / item).exists()]
    require(not present, "강사용·제작 기준선·생성기·비교 자료가 노출되지 않음")


def check_inputs() -> None:
    pptx_path = ROOT / "reverse-spec/input/roomflow_screen_definition.pptx"
    with zipfile.ZipFile(pptx_path) as archive:
        names = archive.namelist()
    slide_count = sum(bool(re.fullmatch(r"ppt/slides/slide\d+\.xml", name)) for name in names)
    note_count = sum(bool(re.fullmatch(r"ppt/notesSlides/notesSlide\d+\.xml", name)) for name in names)
    require(slide_count == 8, "입력 PowerPoint가 8장임")
    require(note_count == 8, "입력 PowerPoint 8장에 발표자 노트가 있음")

    xlsx_path = ROOT / "reverse-spec/input/roomflow_function_definition.xlsx"
    with zipfile.ZipFile(xlsx_path) as archive:
        workbook_xml = archive.read("xl/workbook.xml")
    root = ElementTree.fromstring(workbook_xml)
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    sheet_names = [sheet.attrib["name"] for sheet in root.findall("x:sheets/x:sheet", namespace)]
    expected = ["요약", "화면목록", "화면항목정의", "버튼이벤트", "상태전이", "메시지·권한", "검토메모"]
    require(sheet_names == expected, "입력 Excel의 7개 시트와 순서가 정확함")


def check_empty_outputs() -> None:
    for relative in ("presentation/output", "reverse-spec/output"):
        files = [path.name for path in (ROOT / relative).iterdir() if path.name != ".gitkeep"]
        require(not files, f"{relative}이 빈 상태로 시작함")


def check_readme() -> None:
    text = (ROOT / "README.md").read_text(encoding="utf-8")
    markers = [
        "git clone https://github.com/rkdrn79/hanwha-agent-ai-day2-spec-workshop.git",
        "git switch student-workshop",
        "python3 scripts/check_student_setup.py",
        "## 2. Skill 구조 확인",
        "<summary><code>create-solution-ppt</code> 구성 보기</summary>",
        "<summary><code>office-to-spec</code> 구성 보기</summary>",
        ".claude/skills/office-to-spec/scripts/validate_spec.py",
        ".claude/skills/pptx/LICENSE.txt",
        ".claude/skills/xlsx/LICENSE.txt",
        "## 3. Project → PowerPoint",
        "## 4. Office → SPEC",
        "assets/create-solution-ppt-flow.png",
        "assets/office-to-spec-flow.png",
        "실패 → 원인이 있는 단계로 복귀",
        "### Prompt 0 — Skill 역할 확인",
        "### Prompt 1 — 발표자료 전체 생성",
        "### Prompt 2 — 발표자료 Self-refinement",
        "### Prompt 3 — Office 증거 수집",
        "### Prompt 4 — 충돌과 미결정 내용 분리",
        "### Prompt 5 — SPEC 작성과 검증",
        "PPTX:screen.pptx#S3:B07",
        "reverse-spec/BRIEF.md",
    ]
    require(all(marker in text for marker in markers), "README에 clone부터 결과 검증까지 순서형 실습이 있음")
    workshop_markers = ["30분", "이번 실습", "수강생 Prompt", "8장의 이야기"]
    require(not any(marker in text for marker in workshop_markers), "README에 강의 시간·진행 문구가 없음")


def check_general_skills() -> None:
    skill_rules = {
        ROOT / ".claude/skills/create-solution-ppt/SKILL.md": [
            "docs/SPEC.md",
            "8장",
            "ips_wbs_solution_brief.pptx",
            "주황 표지",
        ],
        ROOT / ".claude/skills/office-to-spec/SKILL.md": [
            "RoomFlow",
            "roomflow_screen_definition.pptx",
            "PPT 8장",
            "Excel 7개 시트",
        ],
    }
    leaked = []
    for skill, forbidden in skill_rules.items():
        text = skill.read_text(encoding="utf-8")
        leaked.extend(
            f"{skill.relative_to(ROOT)}:{marker}" for marker in forbidden if marker in text
        )
        require("BRIEF.md" in text, f"{skill.parent.name} Skill이 프로젝트 Brief를 지원함")
    require(not leaked, "범용 Skill에 예제 프로젝트 고정값이 없음")


def check_public_docs() -> None:
    documents = [
        ROOT / "README.md",
        ROOT / "presentation/README.md",
        ROOT / "presentation/CLAUDE.md",
        ROOT / "reverse-spec/README.md",
        ROOT / "reverse-spec/CLAUDE.md",
        ROOT / ".claude/skills/create-solution-ppt/SKILL.md",
        ROOT / ".claude/skills/office-to-spec/SKILL.md",
    ]
    forbidden = ["instructor", "강사용", "정답 예시", "reverse-spec/expected"]
    exposed = []
    for document in documents:
        text = document.read_text(encoding="utf-8").lower()
        for marker in forbidden:
            if marker.lower() in text:
                exposed.append(f"{document.relative_to(ROOT)}:{marker}")
    require(not exposed, "공개 문서에 내부용·정답 경로가 없음")


def check_readme_links() -> None:
    documents = [
        ROOT / "README.md",
        ROOT / "presentation/README.md",
        ROOT / "reverse-spec/README.md",
        ROOT / ".claude/skills/create-solution-ppt/SKILL.md",
        ROOT / ".claude/skills/create-solution-ppt/references/design-contract.md",
        ROOT / ".claude/skills/office-to-spec/SKILL.md",
    ]
    broken = []
    for document in documents:
        text = document.read_text(encoding="utf-8")
        for target in re.findall(r"!?\[[^]]*\]\(([^)]+)\)", text):
            target = target.strip("<>").split("#", 1)[0]
            if not target or re.match(r"^[a-z]+://", target):
                continue
            if not (document.parent / target).resolve().exists():
                broken.append(f"{document.relative_to(ROOT)} -> {target}")
    require(not broken, "README의 로컬 링크가 모두 유효함")


def main() -> int:
    try:
        check_files()
        check_inputs()
        check_empty_outputs()
        check_readme()
        check_general_skills()
        check_public_docs()
        check_readme_links()
    except AssertionError as error:
        print(json.dumps({"status": "failed", "error": str(error), "checks": checks}, ensure_ascii=False, indent=2))
        return 1

    print(json.dumps({"status": "passed", "check_count": len(checks), "checks": checks}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
