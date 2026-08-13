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
    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
        raise IpsError("출고 수량은 1 이상의 정수여야 합니다.")
    return {
        "request_id": _required(request_id, "출고 요청 번호"),
        "material_code": _required(material_code, "자재 코드"),
        "plant": _required(plant, "플랜트"),
        "storage_location": _required(storage_location, "저장 위치"),
        "wbs": _required(wbs, "WBS"),
        "quantity": quantity,
        "user_id": _required(user_id, "처리자"),
    }


def movement_types(wbs: str) -> tuple[str, str]:
    """제공 설계서의 WBS 접두사별 출고/취소 이동유형을 반환한다."""
    normalized = wbs.strip().upper()
    if normalized.startswith("R2-00"):
        return ("M75", "M76")
    if normalized.startswith("R2-01"):
        return ("M77", "M78")
    return ("221", "222")


def validate_available_stock(available: int, requested: int) -> None:
    """요청 수량이 가용 재고를 초과하면 도메인 오류를 발생시킨다."""
    if requested > available:
        raise IpsError(
            f"재고가 부족합니다. 현재 재고: {available}, 요청 수량: {requested}"
        )


def validate_cancel_status(status: str) -> None:
    """완료 상태의 출고만 취소할 수 있도록 상태를 검증한다."""
    if status == STATUS_CANCELED:
        raise IpsError("이미 취소된 출고입니다.")
    if status != STATUS_COMPLETED:
        raise IpsError("취소할 수 없는 출고 상태입니다.")


def _required(value: str, label: str) -> str:
    """앞뒤 공백을 제거하고 빈 값이면 필수 입력 오류를 발생시킨다."""
    cleaned = value.strip()
    if not cleaned:
        raise IpsError(f"{label}는(은) 필수 입력입니다.")
    return cleaned
