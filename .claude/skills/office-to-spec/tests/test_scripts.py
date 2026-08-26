from __future__ import annotations

import csv
import importlib.util
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[4]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


extractor = load_module("extract_office_evidence", SKILL_DIR / "scripts/extract_office_evidence.py")
validator = load_module("validate_spec", SKILL_DIR / "scripts/validate_spec.py")


def write_csv(path: Path, fields: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def complete_spec(*, vague: bool = False, complete_ac: bool = True) -> str:
    behavior = "적절히 저장한다." if vague else "입력값이 유효하면 예약을 저장한다."
    ac_lines = ["### AC-001. 예약 저장", "- 검증 대상: FR-001"]
    if complete_ac:
        ac_lines.extend(
            [
                "- Given: 유효한 예약 입력값이 있다.",
                "- When: 사용자가 예약 요청을 실행한다.",
                "- Then: 시스템은 예약을 저장한다.",
            ]
        )
    return "\n".join(
        [
            "# Demo SPEC",
            "",
            "## 2. 배경과 문제",
            "## 3. 목표",
            "## 4. 범위",
            "## 5. 사용자와 역할",
            "## 6. 핵심 업무 흐름",
            "## 7. 상태 모델",
            "## 8. 기능 요구사항",
            "### FR-001. 예약 저장",
            behavior,
            "## 9. 데이터와 필드",
            "## 10. 오류와 예외",
            "## 11. 비기능 요구사항",
            "## 12. 인수 조건",
            *ac_lines,
            "## 13. 범위 밖",
            "## 14. 미결정 사항",
            "## 15. 추적성",
            "",
        ]
    )


def evidence_fields() -> list[str]:
    return [
        "evidence_id",
        "source_file",
        "locator",
        "evidence_kind",
        "raw_text",
        "classification",
        "normalized_claim",
        "requirement_id",
        "notes",
    ]


def trace_fields() -> list[str]:
    return [
        "requirement_id",
        "requirement_type",
        "summary",
        "source",
        "status",
        "verification",
        "notes",
    ]


def test_extractor_creates_granular_ppt_and_excel_evidence(tmp_path: Path) -> None:
    pptx = REPO_ROOT / "reverse-spec/input/roomflow_screen_definition.pptx"
    xlsx = REPO_ROOT / "reverse-spec/input/roomflow_function_definition.xlsx"
    ppt_lines, ppt_rows = extractor.extract_pptx(pptx)
    xlsx_lines, xlsx_rows = extractor.extract_xlsx(xlsx)
    extractor.write_outputs(
        tmp_path,
        [pptx, xlsx],
        [*ppt_lines, *xlsx_lines],
        [*ppt_rows, *xlsx_rows],
    )

    with (tmp_path / "02_evidence_ledger.csv").open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    ppt_rows = [row for row in rows if row["source_file"].endswith(".pptx")]
    assert len(ppt_rows) > 50
    assert any(
        row["locator"].startswith("PPTX:roomflow_screen_definition.pptx#S3:B")
        for row in ppt_rows
    )
    assert all(row["locator"] != "PPTX:roomflow_screen_definition.pptx#S3" for row in ppt_rows)
    assert any("(formula)" in row["raw_text"] for row in rows)
    assert any("(validation)" in row["raw_text"] for row in rows)


def test_extractor_supports_xlsx_only(tmp_path: Path) -> None:
    xlsx = REPO_ROOT / "reverse-spec/input/roomflow_function_definition.xlsx"
    inventory_lines, rows = extractor.extract_xlsx(xlsx)
    extractor.write_outputs(tmp_path, [xlsx], inventory_lines, rows)

    inventory = (tmp_path / "01_source_inventory.md").read_text(encoding="utf-8")
    assert xlsx.name in inventory
    assert "PowerPoint:" not in inventory
    assert rows
    assert all(row["locator"].startswith(f"XLSX:{xlsx.name}#") for row in rows)


def test_extractor_keeps_table_rows_under_one_table_locator(tmp_path: Path) -> None:
    deck = extractor.Presentation()
    slide = deck.slides.add_slide(deck.slide_layouts[6])
    table = slide.shapes.add_table(2, 2, 0, 0, 2_000_000, 1_000_000).table
    table.cell(0, 0).text = "Field"
    table.cell(0, 1).text = "Rule"
    table.cell(1, 0).text = "email"
    table.cell(1, 1).text = "required"
    pptx = tmp_path / "screen.pptx"
    deck.save(pptx)

    _, rows = extractor.extract_pptx(pptx)
    table_locators = [row["locator"] for row in rows if row["evidence_kind"] == "slide_table_row"]
    assert table_locators == [
        "PPTX:screen.pptx#S1:T01-R01",
        "PPTX:screen.pptx#S1:T01-R02",
    ]


def test_source_labels_disambiguate_repeated_basenames(tmp_path: Path) -> None:
    first = tmp_path / "a" / "rules.xlsx"
    second = tmp_path / "b" / "rules.xlsx"
    labels = extractor.source_labels([first, second])

    assert labels[0] != labels[1]
    assert all(label.startswith("rules-") and label.endswith(".xlsx") for label in labels)


def test_validator_accepts_traceable_and_testable_spec(tmp_path: Path) -> None:
    spec = tmp_path / "SPEC.md"
    trace = tmp_path / "TRACEABILITY.csv"
    questions = tmp_path / "OPEN_QUESTIONS.md"
    evidence = tmp_path / "02_evidence_ledger.csv"
    spec.write_text(complete_spec(), encoding="utf-8")
    questions.write_text(
        "# Open questions\n\n## OPEN-001. 조회 범위\n- 원본 위치: XLSX:rules.xlsx#Screens!A5:H5\n- 영향: 기본 조회 조건\n",
        encoding="utf-8",
    )
    write_csv(
        evidence,
        evidence_fields(),
        [
            {
                "evidence_id": "PPT-S01-B07",
                "source_file": "screen.pptx",
                "locator": "PPTX:screen.pptx#S1:B07",
                "evidence_kind": "slide_text",
                "raw_text": "유효한 입력값을 저장한다.",
                "classification": "confirmed",
                "normalized_claim": "예약 저장",
                "requirement_id": "FR-001;AC-001",
                "notes": "",
            },
            {
                "evidence_id": "XLSX-ROW-005",
                "source_file": "rules.xlsx",
                "locator": "XLSX:rules.xlsx#Screens!A5:H5",
                "evidence_kind": "excel_row",
                "raw_text": "조회 범위 검토 필요",
                "classification": "conflict",
                "normalized_claim": "조회 범위 충돌",
                "requirement_id": "",
                "notes": "",
            },
        ],
    )
    write_csv(
        trace,
        trace_fields(),
        [
            {
                "requirement_id": "FR-001",
                "requirement_type": "FR",
                "summary": "예약 저장",
                "source": "PPTX:screen.pptx#S1:B07",
                "status": "confirmed",
                "verification": "유효한 입력으로 저장 API 결과를 확인",
                "notes": "",
            },
            {
                "requirement_id": "AC-001",
                "requirement_type": "AC",
                "summary": "예약 저장 시나리오",
                "source": "PPTX:screen.pptx#S1:B07",
                "status": "confirmed",
                "verification": "Given/When/Then 시나리오 자동 테스트",
                "notes": "",
            },
        ],
    )

    result = validator.validate(spec, trace, questions, evidence)
    assert result["status"] == "passed", result["errors"]


def test_validator_rejects_bogus_source_vague_rule_and_weak_ac(tmp_path: Path) -> None:
    spec = tmp_path / "SPEC.md"
    trace = tmp_path / "TRACEABILITY.csv"
    questions = tmp_path / "OPEN_QUESTIONS.md"
    evidence = tmp_path / "02_evidence_ledger.csv"
    spec.write_text(complete_spec(vague=True, complete_ac=False), encoding="utf-8")
    questions.write_text("# Open questions\n", encoding="utf-8")
    write_csv(
        evidence,
        evidence_fields(),
        [
            {
                "evidence_id": "PPT-S01-B07",
                "source_file": "screen.pptx",
                "locator": "PPTX:screen.pptx#S1:B07",
                "evidence_kind": "slide_text",
                "raw_text": "유효한 입력값을 저장한다.",
                "classification": "confirmed",
                "normalized_claim": "예약 저장",
                "requirement_id": "",
                "notes": "",
            }
        ],
    )
    write_csv(
        trace,
        trace_fields(),
        [
            {
                "requirement_id": requirement_id,
                "requirement_type": requirement_id.split("-", 1)[0],
                "summary": "부실한 규칙",
                "source": "PPTX:screen.pptx#S999:B01",
                "status": "confirmed",
                "verification": "확인",
                "notes": "",
            }
            for requirement_id in ("FR-001", "AC-001")
        ],
    )

    result = validator.validate(spec, trace, questions, evidence)
    errors = "\n".join(result["errors"])
    assert result["status"] == "failed"
    assert "존재하지 않는 원본 위치" in errors
    assert "검증 불가능한 표현" in errors
    assert "Given 조건이 없음" in errors
    assert "검증 방법이 구체적이지 않음" in errors


def test_validator_rejects_empty_contract(tmp_path: Path) -> None:
    spec = tmp_path / "SPEC.md"
    trace = tmp_path / "TRACEABILITY.csv"
    questions = tmp_path / "OPEN_QUESTIONS.md"
    evidence = tmp_path / "02_evidence_ledger.csv"
    spec.write_text("# Empty SPEC\n\n" + "\n\n".join(validator.REQUIRED_HEADINGS), encoding="utf-8")
    questions.write_text("# Open questions\n", encoding="utf-8")
    write_csv(trace, trace_fields(), [])
    write_csv(evidence, evidence_fields(), [])

    result = validator.validate(spec, trace, questions, evidence)
    errors = "\n".join(result["errors"])
    assert result["status"] == "failed"
    assert "기능 요구사항 FR이 없음" in errors
    assert "인수 조건 AC가 없음" in errors
    assert "증거 행이 없음" in errors
