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
    raise NotImplementedError("TODO: 승인된 SPEC과 Architecture를 기준으로 구현하세요.")


def movement_types(wbs: str) -> tuple[str, str]:
    """제공 설계서의 WBS 접두사별 출고/취소 이동유형을 반환한다."""
    raise NotImplementedError("TODO: 승인된 이동유형 규칙을 구현하세요.")


def validate_available_stock(available: int, requested: int) -> None:
    raise NotImplementedError("TODO: 승인된 재고 부족 정책을 구현하세요.")


def validate_cancel_status(status: str) -> None:
    raise NotImplementedError("TODO: 승인된 취소 상태 규칙을 구현하세요.")


def _required(value: str, label: str) -> str:
    raise NotImplementedError("TODO: 승인된 필수 입력 규칙을 구현하세요.")
