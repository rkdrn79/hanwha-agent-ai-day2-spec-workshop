"""재고 조회, 출고, 전체 취소 유스케이스 조정 계층."""

import engine
import store


def list_inventory(wbs: str | None = None) -> list[dict]:
    return store.list_inventory(wbs)


def create_shipment(
    request_id: str,
    material_code: str,
    plant: str,
    storage_location: str,
    wbs: str,
    quantity: int,
    user_id: str,
) -> dict:
    payload = engine.validate_outbound_input(
        request_id,
        material_code,
        plant,
        storage_location,
        wbs,
        quantity,
        user_id,
    )
    if store.has_request_id(payload["request_id"]):
        raise engine.IpsError("이미 처리된 출고 요청 번호입니다.")

    try:
        inventory = store.get_inventory(
            payload["material_code"],
            payload["plant"],
            payload["storage_location"],
            payload["wbs"],
        )
    except store.InventoryNotFoundError as error:
        raise engine.IpsError("일치하는 재고를 찾을 수 없습니다.") from error

    engine.validate_available_stock(inventory["quantity"], payload["quantity"])
    movement_type, _ = engine.movement_types(payload["wbs"])
    return store.complete_shipment(payload, movement_type)


def cancel_shipment(shipment_id: int, user_id: str) -> dict:
    normalized_user = (user_id or "").strip()
    if not normalized_user:
        raise engine.IpsError("처리자: 필수 입력값입니다.")

    shipment = _get_shipment(shipment_id)
    engine.validate_cancel_status(shipment["status"])
    _, cancel_movement_type = engine.movement_types(shipment["wbs"])
    return store.cancel_shipment(shipment_id, cancel_movement_type, normalized_user)


def list_shipments() -> list[dict]:
    return store.list_shipments()


def get_shipment(shipment_id: int) -> dict:
    return _get_shipment(shipment_id)


def reset_demo() -> dict:
    store.reset_for_tests()
    return {"status": "reset"}


def _get_shipment(shipment_id: int) -> dict:
    try:
        return store.get_shipment(shipment_id)
    except store.ShipmentNotFoundError as error:
        raise engine.IpsError("출고 내역을 찾을 수 없습니다.") from error
