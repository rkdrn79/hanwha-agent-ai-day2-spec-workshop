#!/usr/bin/env python3
"""Validate SPEC structure, evidence provenance, questions, and testability."""

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
    "## 5. 사용자와 역할",
    "## 6. 핵심 업무 흐름",
    "## 7. 상태 모델",
    "## 8. 기능 요구사항",
    "## 9. 데이터와 필드",
    "## 10. 오류와 예외",
    "## 11. 비기능 요구사항",
    "## 12. 인수 조건",
    "## 13. 범위 밖",
    "## 14. 미결정 사항",
    "## 15. 추적성",
]
REQUIRED_SECTION_NUMBERS = set(range(2, 16))
REQ_PATTERN = re.compile(r"\b(?:FR|NFR|AC)-\d{3}\b")
REQ_HEADING_PATTERN = re.compile(r"(?m)^(?:#{3,4}\s*)?((?:FR|NFR|AC)-\d{3})\b[^\n]*")
SECTION_PATTERN = re.compile(r"(?m)^##\s")
SOURCE_PATTERN = re.compile(
    r"(?:"
    r"PPTX:[^#;\n]+#S\d+:(?:NOTES|B\d+|T\d+-R\d+)"
    r"|PPT:S\d+:(?:NOTES|B\d+|T\d+-R\d+)"
    r"|XLSX:[^#;\n]+#[^!;\n]+![A-Z]+\d+(?::[A-Z]+\d+)?"
    r"|XLSX:[^!;\n]+![A-Z]+\d+(?::[A-Z]+\d+)?"
    r")"
)
OPEN_PATTERN = re.compile(r"\bOPEN-\d{3}\b")
ALLOWED_STATUS = {"confirmed", "conflict", "ambiguous", "candidate", "out-of-scope"}
UNRESOLVED_STATUS = {"conflict", "ambiguous", "candidate"}
VAGUE_TERMS = (
    "적절히",
    "충분히",
    "필요 시",
    "빠르게",
    "신속히",
    "원활하게",
    "appropriate",
    "as needed",
    "sufficient",
    "quickly",
    "user-friendly",
)
WEAK_VERIFICATIONS = {"확인", "검증", "테스트", "육안", "육안 확인", "수동 확인", "manual", "test"}
REQUIRED_TRACE_COLUMNS = {
    "requirement_id",
    "requirement_type",
    "summary",
    "source",
    "status",
    "verification",
    "notes",
}
REQUIRED_EVIDENCE_COLUMNS = {
    "evidence_id",
    "source_file",
    "locator",
    "evidence_kind",
    "raw_text",
    "classification",
    "normalized_claim",
    "requirement_id",
    "notes",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, required=True)
    parser.add_argument("--traceability", type=Path, required=True)
    parser.add_argument("--questions", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    return parser.parse_args()


def load_csv(path: Path) -> tuple[list[dict[str, str]], set[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader), set(reader.fieldnames or [])


def requirement_blocks(spec_text: str) -> tuple[dict[str, str], set[str]]:
    matches = list(REQ_HEADING_PATTERN.finditer(spec_text))
    section_starts = [match.start() for match in SECTION_PATTERN.finditer(spec_text)]
    blocks: dict[str, str] = {}
    duplicates: set[str] = set()

    for index, match in enumerate(matches):
        requirement_id = match.group(1)
        candidates = section_starts + [item.start() for item in matches[index + 1 :]]
        end = min((position for position in candidates if position > match.start()), default=len(spec_text))
        if requirement_id in blocks:
            duplicates.add(requirement_id)
        else:
            blocks[requirement_id] = spec_text[match.start() : end]
    return blocks, duplicates


def validate(
    spec_path: Path,
    traceability_path: Path,
    questions_path: Path,
    evidence_path: Path,
) -> dict[str, object]:
    spec_text = spec_path.read_text(encoding="utf-8")
    questions_text = questions_path.read_text(encoding="utf-8")
    trace_rows, trace_headers = load_csv(traceability_path)
    evidence_rows, evidence_headers = load_csv(evidence_path)
    errors: list[str] = []
    warnings: list[str] = []

    section_numbers = {
        int(number) for number in re.findall(r"(?m)^##\s+(\d+)\.", spec_text)
    }
    for number in sorted(REQUIRED_SECTION_NUMBERS - section_numbers):
        errors.append(f"필수 섹션 누락: ## {number}.")

    missing_trace_columns = sorted(REQUIRED_TRACE_COLUMNS - trace_headers)
    if missing_trace_columns:
        errors.append(f"TRACEABILITY.csv 필수 열 누락: {', '.join(missing_trace_columns)}")
    missing_evidence_columns = sorted(REQUIRED_EVIDENCE_COLUMNS - evidence_headers)
    if missing_evidence_columns:
        errors.append(f"evidence ledger 필수 열 누락: {', '.join(missing_evidence_columns)}")

    blocks, duplicate_spec_ids = requirement_blocks(spec_text)
    spec_ids = set(blocks)
    if not any(requirement_id.startswith("FR-") for requirement_id in spec_ids):
        errors.append("SPEC에 기능 요구사항 FR이 없음")
    if not any(requirement_id.startswith("AC-") for requirement_id in spec_ids):
        errors.append("SPEC에 인수 조건 AC가 없음")
    for requirement_id in sorted(duplicate_spec_ids):
        errors.append(f"SPEC 요구사항 ID 중복: {requirement_id}")

    evidence_by_locator: dict[str, dict[str, str]] = {}
    duplicate_evidence_ids: set[str] = set()
    seen_evidence_ids: set[str] = set()
    unresolved_rows: list[dict[str, str]] = []
    if not evidence_rows:
        errors.append("evidence ledger에 증거 행이 없음")
    for row_no, row in enumerate(evidence_rows, start=2):
        evidence_id = row.get("evidence_id", "").strip()
        locator = row.get("locator", "").strip()
        classification = row.get("classification", "").strip()
        if not evidence_id:
            errors.append(f"evidence ledger {row_no}행 evidence_id가 비어 있음")
        elif evidence_id in seen_evidence_ids:
            duplicate_evidence_ids.add(evidence_id)
        seen_evidence_ids.add(evidence_id)
        if not locator:
            errors.append(f"evidence ledger {row_no}행 locator가 비어 있음")
        elif locator in evidence_by_locator:
            errors.append(f"evidence locator 중복: {locator}")
        else:
            evidence_by_locator[locator] = row
        if classification not in ALLOWED_STATUS:
            errors.append(
                f"evidence ledger {row_no}행 classification 오류: {classification or '(빈 값)'}"
            )
        if classification in UNRESOLVED_STATUS:
            unresolved_rows.append(row)
    for evidence_id in sorted(duplicate_evidence_ids):
        errors.append(f"evidence ID 중복: {evidence_id}")

    trace_ids: set[str] = set()
    duplicate_trace_ids: set[str] = set()
    seen_trace_ids: set[str] = set()
    for row_no, row in enumerate(trace_rows, start=2):
        requirement_id = row.get("requirement_id", "").strip()
        if not requirement_id and not any((value or "").strip() for value in row.values()):
            continue
        requirement_type = row.get("requirement_type", "").strip()
        summary = row.get("summary", "").strip()
        status = row.get("status", "").strip()
        source = row.get("source", "").strip()
        verification = row.get("verification", "").strip()

        if not REQ_PATTERN.fullmatch(requirement_id):
            errors.append(f"추적표 {row_no}행 requirement_id 오류: {requirement_id or '(빈 값)'}")
            continue
        trace_ids.add(requirement_id)
        if requirement_id in seen_trace_ids:
            duplicate_trace_ids.add(requirement_id)
        seen_trace_ids.add(requirement_id)

        expected_type = requirement_id.split("-", 1)[0]
        if requirement_type != expected_type:
            errors.append(
                f"{requirement_id}의 requirement_type 불일치: {requirement_type or '(빈 값)'}"
            )
        if not summary:
            errors.append(f"{requirement_id}의 summary가 비어 있음")
        if status != "confirmed":
            errors.append(f"{requirement_id}는 confirmed가 아님: {status or '(빈 값)'}")

        locators = SOURCE_PATTERN.findall(source)
        if not locators:
            errors.append(f"{requirement_id}의 유효한 원본 위치가 없음")
        for locator in locators:
            evidence = evidence_by_locator.get(locator)
            if evidence is None:
                errors.append(f"{requirement_id}가 존재하지 않는 원본 위치를 참조함: {locator}")
            elif evidence.get("classification", "").strip() != "confirmed":
                errors.append(
                    f"{requirement_id}가 confirmed가 아닌 증거를 참조함: "
                    f"{locator} ({evidence.get('classification', '').strip() or '빈 값'})"
                )

        normalized_verification = " ".join(verification.lower().split())
        if not verification:
            errors.append(f"{requirement_id}의 검증 방법이 없음")
        elif len(normalized_verification) < 6 or normalized_verification in WEAK_VERIFICATIONS:
            errors.append(f"{requirement_id}의 검증 방법이 구체적이지 않음: {verification}")

    for requirement_id in sorted(duplicate_trace_ids):
        errors.append(f"추적표 ID 중복: {requirement_id}")
    for requirement_id in sorted(spec_ids - trace_ids):
        errors.append(f"추적표에 없는 요구사항: {requirement_id}")
    for requirement_id in sorted(trace_ids - spec_ids):
        errors.append(f"SPEC 본문에 없는 추적표 ID: {requirement_id}")

    covered_requirements: set[str] = set()
    for requirement_id, block in blocks.items():
        for vague_term in VAGUE_TERMS:
            if vague_term in block:
                errors.append(f"{requirement_id}에 검증 불가능한 표현이 있음: {vague_term}")
        if requirement_id.startswith("AC-"):
            for keyword in ("Given", "When", "Then"):
                if not re.search(rf"(?im)^\s*-?\s*{keyword}\s*:", block):
                    errors.append(f"{requirement_id}에 {keyword} 조건이 없음")
            targets = set(re.findall(r"\b(?:FR|NFR)-\d{3}\b", block))
            if not targets:
                errors.append(f"{requirement_id}에 검증 대상 FR/NFR ID가 없음")
            for target in sorted(targets - spec_ids):
                errors.append(f"{requirement_id}가 SPEC에 없는 검증 대상을 참조함: {target}")
            covered_requirements.update(targets)

    for requirement_id in sorted(item for item in spec_ids if item.startswith("FR-")):
        if requirement_id not in covered_requirements:
            errors.append(f"인수 조건에서 검증되지 않는 기능 요구사항: {requirement_id}")

    open_ids = set(OPEN_PATTERN.findall(questions_text))
    if unresolved_rows and not open_ids:
        errors.append("미결정 증거가 있지만 OPEN_QUESTIONS.md에 OPEN ID가 없음")
    for row in unresolved_rows:
        locator = row.get("locator", "").strip()
        evidence_id = row.get("evidence_id", "").strip()
        if locator and locator not in questions_text:
            errors.append(f"OPEN_QUESTIONS.md에 반영되지 않은 미결정 증거: {evidence_id} ({locator})")
    if not unresolved_rows and not open_ids:
        warnings.append("미결정 증거와 OPEN ID가 모두 없음")

    return {
        "status": "passed" if not errors else "failed",
        "spec_requirement_count": len(spec_ids),
        "traceability_requirement_count": len(trace_ids),
        "evidence_count": len(evidence_rows),
        "unresolved_evidence_count": len(unresolved_rows),
        "open_question_count": len(open_ids),
        "errors": errors,
        "warnings": warnings,
    }


def main() -> int:
    args = parse_args()
    paths = (args.spec, args.traceability, args.questions, args.evidence)
    missing_files = [str(path) for path in paths if not path.is_file()]
    if missing_files:
        print(json.dumps({"status": "failed", "missing_files": missing_files}, ensure_ascii=False))
        return 1

    result = validate(args.spec, args.traceability, args.questions, args.evidence)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
