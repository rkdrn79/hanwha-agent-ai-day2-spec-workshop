"""IPS WBS 출고·취소 MVP의 순수 업무 규칙."""

STATUS_COMPLETED = "COMPLETED"
STATUS_CANCELED = "CANCELED"


class IpsError(ValueError):
    """사용자가 입력이나 업무 순서를 수정할 수 있는 도메인 오류."""


def validate_outbound_input(
    request_id: str,
    material_code: str,
    plant: str,
    storage_location: str,
    wbs: str,
    quantity: int,
    user_id: str,
) -> dict:
    """출고 입력의 필수값과 수량을 검증하고 공백을 정리한다."""

    values = {
        "request_id": _required(request_id, "출고 요청 번호"),
        "material_code": _required(material_code, "자재코드"),
        "plant": _required(plant, "플랜트"),
        "storage_location": _required(storage_location, "저장위치"),
        "wbs": _required(wbs, "WBS"),
        "user_id": _required(user_id, "처리자"),
    }
    if quantity < 1:
        raise IpsError("출고 수량은 1 이상이어야 합니다.")
    values["quantity"] = quantity
    return values


def movement_types(wbs: str) -> tuple[str, str]:
    """제공 설계서의 WBS 접두사별 출고/취소 이동유형을 반환한다."""

    normalized = _required(wbs, "WBS").upper()
    if normalized.startswith("R2-00"):
        return "M75", "M76"
    if normalized.startswith("R2-01"):
        return "M77", "M78"
    return "221", "222"


def validate_available_stock(available: int, requested: int) -> None:
    if available < requested:
        raise IpsError(
            f"재고가 부족합니다. 현재 재고: {available}, 요청 수량: {requested}"
        )


def validate_cancel_status(status: str) -> None:
    if status == STATUS_CANCELED:
        raise IpsError("이미 취소된 출고입니다.")
    if status != STATUS_COMPLETED:
        raise IpsError("출고 완료 건만 취소할 수 있습니다.")


def _required(value: str, label: str) -> str:
    normalized = (value or "").strip()
    if not normalized:
        raise IpsError(f"{label}: 필수 입력값입니다.")
    return normalized
