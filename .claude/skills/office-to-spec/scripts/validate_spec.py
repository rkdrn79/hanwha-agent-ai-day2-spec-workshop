#!/usr/bin/env python3
"""Validate SPEC requirement IDs and traceability coverage."""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path


REQUIRED_HEADINGS = [
    "## 2. 배경과 문제",
    "## 3. 목표",
    "## 4. 범위",
    "## 6. 핵심 업무 흐름",
    "## 8. 기능 요구사항",
    "## 10. 오류와 예외",
    "## 12. 인수 조건",
    "## 13. 범위 밖",
    "## 14. 미결정 사항",
]
REQ_PATTERN = re.compile(r"\b(?:FR|NFR|AC)-\d{3}\b")
SOURCE_PATTERN = re.compile(
    r"(?:PPT:S\d+(?::NOTES)?|XLSX:[^!;\n]+![A-Z]+\d+(?::[A-Z]+\d+)?)"
)
ALLOWED_STATUS = {"confirmed", "conflict", "ambiguous", "candidate", "out-of-scope"}
REQUIRED_COLUMNS = {
    "requirement_id",
    "requirement_type",
    "summary",
    "source",
    "status",
    "verification",
    "notes",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, required=True)
    parser.add_argument("--traceability", type=Path, required=True)
    parser.add_argument("--questions", type=Path, required=True)
    return parser.parse_args()


def load_traceability(path: Path) -> tuple[list[dict[str, str]], set[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader), set(reader.fieldnames or [])


def main() -> int:
    args = parse_args()
    missing_files = [
        str(path) for path in (args.spec, args.traceability, args.questions) if not path.is_file()
    ]
    if missing_files:
        print(json.dumps({"status": "failed", "missing_files": missing_files}, ensure_ascii=False))
        return 1

    spec_text = args.spec.read_text(encoding="utf-8")
    questions_text = args.questions.read_text(encoding="utf-8")
    rows, headers = load_traceability(args.traceability)
    errors: list[str] = []
    warnings: list[str] = []

    for heading in REQUIRED_HEADINGS:
        if heading not in spec_text:
            errors.append(f"필수 섹션 누락: {heading}")

    missing_columns = sorted(REQUIRED_COLUMNS - headers)
    if missing_columns:
        errors.append(f"TRACEABILITY.csv 필수 열 누락: {', '.join(missing_columns)}")

    spec_ids = set(REQ_PATTERN.findall(spec_text))
    trace_ids = {
        row.get("requirement_id", "").strip()
        for row in rows
        if REQ_PATTERN.fullmatch(row.get("requirement_id", "").strip())
    }
    for requirement_id in sorted(spec_ids - trace_ids):
        errors.append(f"추적표에 없는 요구사항: {requirement_id}")
    for requirement_id in sorted(trace_ids - spec_ids):
        warnings.append(f"SPEC 본문에 없는 추적표 ID: {requirement_id}")

    duplicate_ids: set[str] = set()
    seen_ids: set[str] = set()
    for row_no, row in enumerate(rows, start=2):
        requirement_id = row.get("requirement_id", "").strip()
        status = row.get("status", "").strip()
        source = row.get("source", "").strip()
        verification = row.get("verification", "").strip()
        if status and status not in ALLOWED_STATUS:
            errors.append(f"추적표 {row_no}행 status 오류: {status}")
        if requirement_id and requirement_id in seen_ids:
            duplicate_ids.add(requirement_id)
        seen_ids.add(requirement_id)
        if REQ_PATTERN.fullmatch(requirement_id):
            if status != "confirmed":
                errors.append(f"{requirement_id}는 confirmed가 아님: {status or '(빈 값)'}")
            if not source or not SOURCE_PATTERN.search(source):
                errors.append(f"{requirement_id}의 유효한 원본 위치가 없음")
            if not verification:
                errors.append(f"{requirement_id}의 검증 방법이 없음")

    for requirement_id in sorted(duplicate_ids):
        errors.append(f"추적표 ID 중복: {requirement_id}")

    if not re.search(r"\bOPEN-\d{3}\b", questions_text):
        warnings.append("OPEN_QUESTIONS.md에 OPEN ID가 없음")

    result = {
        "status": "passed" if not errors else "failed",
        "spec_requirement_count": len(spec_ids),
        "traceability_requirement_count": len(trace_ids),
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
