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
    raise NotImplementedError("TODO: 승인된 SPEC과 Architecture를 기준으로 구현하세요.")


def cancel_shipment(shipment_id: int, user_id: str) -> dict:
    raise NotImplementedError("TODO: 승인된 SPEC과 Architecture를 기준으로 구현하세요.")


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
