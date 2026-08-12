"""현재 프로세스에서만 유지되는 재고·출고 저장소."""

import copy
import itertools
from datetime import datetime, timezone

from data import DEMO_INVENTORY


class InventoryNotFoundError(LookupError):
    pass


class ShipmentNotFoundError(LookupError):
    pass


_inventory: dict[tuple[str, str, str, str], dict] = {}
_shipments: dict[int, dict] = {}
_request_ids: set[str] = set()
_shipment_sequence = itertools.count(1)


def _key(material_code: str, plant: str, storage_location: str, wbs: str) -> tuple:
    return material_code, plant, storage_location, wbs


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def list_inventory(wbs: str | None = None) -> list[dict]:
    items = [copy.deepcopy(item) for item in _inventory.values()]
    if wbs:
        items = [item for item in items if item["wbs"] == wbs.strip()]
    return items


def get_inventory(material_code: str, plant: str, storage_location: str, wbs: str) -> dict:
    item = _inventory.get(_key(material_code, plant, storage_location, wbs))
    if item is None:
        raise InventoryNotFoundError
    return copy.deepcopy(item)


def has_request_id(request_id: str) -> bool:
    return request_id in _request_ids


def complete_shipment(payload: dict, movement_type: str) -> dict:
    """검증이 끝난 출고를 기록하고 재고를 한 번만 차감한다."""

    key = _key(
        payload["material_code"],
        payload["plant"],
        payload["storage_location"],
        payload["wbs"],
    )
    item = _inventory[key]
    item["quantity"] -= payload["quantity"]

    shipment_id = next(_shipment_sequence)
    shipment = {
        "shipment_id": shipment_id,
        **payload,
        "unit": item["unit"],
        "movement_type": movement_type,
        "cancel_movement_type": None,
        "status": "COMPLETED",
        "stock_after": item["quantity"],
        "completed_at": now_iso(),
        "canceled_at": None,
        "canceled_by": None,
    }
    _shipments[shipment_id] = shipment
    _request_ids.add(payload["request_id"])
    return copy.deepcopy(shipment)


def get_shipment(shipment_id: int) -> dict:
    shipment = _shipments.get(shipment_id)
    if shipment is None:
        raise ShipmentNotFoundError
    return copy.deepcopy(shipment)


def list_shipments() -> list[dict]:
    return [copy.deepcopy(item) for item in reversed(list(_shipments.values()))]


def cancel_shipment(shipment_id: int, cancel_movement_type: str, user_id: str) -> dict:
    """완료 출고의 원래 수량 전체를 재고에 되돌린다."""

    shipment = _shipments[shipment_id]
    key = _key(
        shipment["material_code"],
        shipment["plant"],
        shipment["storage_location"],
        shipment["wbs"],
    )
    item = _inventory[key]
    item["quantity"] += shipment["quantity"]
    shipment["status"] = "CANCELED"
    shipment["cancel_movement_type"] = cancel_movement_type
    shipment["stock_after"] = item["quantity"]
    shipment["canceled_at"] = now_iso()
    shipment["canceled_by"] = user_id
    return copy.deepcopy(shipment)


def reset_for_tests() -> None:
    global _shipment_sequence
    _inventory.clear()
    for item in DEMO_INVENTORY:
        cloned = copy.deepcopy(item)
        _inventory[_key(
            cloned["material_code"],
            cloned["plant"],
            cloned["storage_location"],
            cloned["wbs"],
        )] = cloned
    _shipments.clear()
    _request_ids.clear()
    _shipment_sequence = itertools.count(1)


reset_for_tests()
