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
        raise engine.IpsError(
            f"이미 처리된 출고 요청 번호입니다: {payload['request_id']}"
        )

    try:
        item = store.get_inventory(
            payload["material_code"],
            payload["plant"],
            payload["storage_location"],
            payload["wbs"],
        )
    except store.InventoryNotFoundError as error:
        raise engine.IpsError("일치하는 재고가 없습니다.") from error

    engine.validate_available_stock(item["quantity"], payload["quantity"])

    outbound_type, _ = engine.movement_types(payload["wbs"])
    return store.complete_shipment(payload, outbound_type)


def cancel_shipment(shipment_id: int, user_id: str) -> dict:
    shipment = _get_shipment(shipment_id)
    engine.validate_cancel_status(shipment["status"])
    cancel_type = engine.movement_types(shipment["wbs"])[1]
    return store.cancel_shipment(shipment_id, cancel_type, user_id)


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
