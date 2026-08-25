#!/usr/bin/env python3
"""Extract traceable raw evidence from PPTX and XLSX files."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from typing import Iterable

from openpyxl import load_workbook
from pptx import Presentation


def clean(value: object) -> str:
    if value is None:
        return ""
    return " ".join(str(value).replace("\n", " ").split())


def md_escape(value: object) -> str:
    return clean(value).replace("|", "\\|")


def is_slide_chrome(text: str) -> bool:
    return text in {
        "WHY",
        "SCOPE",
        "FLOW",
        "RULE",
        "OPEN",
        "OFFICE → SPEC",
        "PPT/Excel → SPEC 실습 입력 · Draft",
    } or (text.isdigit() and len(text) == 1)


def iter_slide_blocks(slide) -> Iterable[tuple[str, str]]:
    block_no = 0
    for shape in slide.shapes:
        if getattr(shape, "has_text_frame", False):
            text = clean(shape.text)
            if text:
                block_no += 1
                yield f"B{block_no:02d}", text
        if getattr(shape, "has_table", False):
            for row_no, row in enumerate(shape.table.rows, start=1):
                values = [clean(cell.text) for cell in row.cells]
                if any(values):
                    block_no += 1
                    yield f"T{block_no:02d}-R{row_no:02d}", " | ".join(values)


def extract_pptx(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    deck = Presentation(path)
    lines = [f"## PowerPoint: `{path.name}`", "", f"- 슬라이드 수: {len(deck.slides)}", ""]
    evidence: list[dict[str, str]] = []

    for slide_no, slide in enumerate(deck.slides, start=1):
        lines.extend([f"### PPT:S{slide_no}", ""])
        blocks = list(iter_slide_blocks(slide))
        if not blocks:
            lines.append("- 본문 텍스트 없음")
        for block_id, text in blocks:
            lines.append(f"- `{block_id}` {md_escape(text)}")
        meaningful = [text for _, text in blocks if not is_slide_chrome(text)]
        if meaningful:
            evidence.append(
                {
                    "evidence_id": f"PPT-S{slide_no:02d}",
                    "source_file": path.name,
                    "locator": f"PPT:S{slide_no}",
                    "raw_text": " | ".join(meaningful),
                    "classification": "",
                    "normalized_claim": "",
                    "requirement_id": "",
                    "notes": "",
                }
            )

        notes_text = ""
        try:
            notes_text = clean(slide.notes_slide.notes_text_frame.text)
        except (AttributeError, ValueError):
            notes_text = ""
        if notes_text:
            lines.append(f"- `NOTES` {md_escape(notes_text)}")
            evidence.append(
                {
                    "evidence_id": f"PPT-S{slide_no:02d}-NOTES",
                    "source_file": path.name,
                    "locator": f"PPT:S{slide_no}:NOTES",
                    "raw_text": notes_text,
                    "classification": "",
                    "normalized_claim": "",
                    "requirement_id": "",
                    "notes": "",
                }
            )
        lines.append("")

    return lines, evidence


def extract_xlsx(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    wb = load_workbook(path, data_only=False)
    lines = [f"## Excel: `{path.name}`", "", f"- 시트 수: {len(wb.worksheets)}", ""]
    evidence: list[dict[str, str]] = []

    for ws in wb.worksheets:
        lines.extend(
            [
                f"### XLSX:{ws.title}",
                "",
                f"- 상태: `{ws.sheet_state}`",
                f"- 사용 범위: `{ws.calculate_dimension()}`",
            ]
        )
        if ws.merged_cells.ranges:
            merged = ", ".join(str(item) for item in ws.merged_cells.ranges)
            lines.append(f"- 병합 범위: `{merged}`")
        if ws.data_validations.count:
            validations = []
            for validation in ws.data_validations.dataValidation:
                validations.append(
                    f"{validation.sqref} ({validation.type}: {validation.formula1 or ''})"
                )
            lines.append(f"- 데이터 검증: `{'; '.join(validations)}`")
        lines.append("")

        for row_no in range(1, ws.max_row + 1):
            cells = [cell for cell in ws[row_no] if cell.value is not None]
            if not cells:
                continue
            start = min(cell.column for cell in cells)
            end = max(cell.column for cell in cells)
            start_coord = ws.cell(row_no, start).coordinate
            end_coord = ws.cell(row_no, end).coordinate
            locator = f"XLSX:{ws.title}!{start_coord}:{end_coord}"
            parts = []
            comments = []
            for cell in cells:
                parts.append(f"{cell.coordinate}={clean(cell.value)}")
                if cell.comment and clean(cell.comment.text):
                    comments.append(f"{cell.coordinate} comment={clean(cell.comment.text)}")
            raw_text = " | ".join(parts)
            if comments:
                raw_text += " | " + " | ".join(comments)
            lines.append(f"- `{locator}` {md_escape(raw_text)}")
            evidence.append(
                {
                    "evidence_id": f"XLSX-{ws.title}-R{row_no:03d}",
                    "source_file": path.name,
                    "locator": locator,
                    "raw_text": raw_text,
                    "classification": "",
                    "normalized_claim": "",
                    "requirement_id": "",
                    "notes": "",
                }
            )
        lines.append("")

    return lines, evidence


def write_outputs(
    output_dir: Path,
    pptx_path: Path,
    xlsx_path: Path,
    inventory_lines: list[str],
    evidence: list[dict[str, str]],
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    inventory = [
        "# Office source inventory",
        "",
        "> 자동 추출 결과입니다. 슬라이드 렌더링과 실제 셀·수식 확인을 함께 수행하세요.",
        "",
        "## 입력 파일",
        "",
        f"- `{pptx_path}`",
        f"- `{xlsx_path}`",
        "",
        *inventory_lines,
    ]
    (output_dir / "01_source_inventory.md").write_text(
        "\n".join(inventory).rstrip() + "\n", encoding="utf-8"
    )

    fields = [
        "evidence_id",
        "source_file",
        "locator",
        "raw_text",
        "classification",
        "normalized_claim",
        "requirement_id",
        "notes",
    ]
    with (output_dir / "02_evidence_ledger.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(evidence)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pptx", type=Path, required=True)
    parser.add_argument("--xlsx", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    for path in (args.pptx, args.xlsx):
        if not path.is_file():
            raise SystemExit(f"입력 파일을 찾을 수 없습니다: {path}")

    ppt_lines, ppt_evidence = extract_pptx(args.pptx)
    xlsx_lines, xlsx_evidence = extract_xlsx(args.xlsx)
    write_outputs(
        args.output_dir,
        args.pptx,
        args.xlsx,
        [*ppt_lines, *xlsx_lines],
        [*ppt_evidence, *xlsx_evidence],
    )
    print(f"created: {args.output_dir / '01_source_inventory.md'}")
    print(f"created: {args.output_dir / '02_evidence_ledger.csv'}")
    print(f"evidence rows: {len(ppt_evidence) + len(xlsx_evidence)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
