"""재고 조회→출고→전체 취소 업무 흐름 테스트."""

import sys
import unittest
from pathlib import Path


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

import engine
import service
import store


class ShipmentLifecycleTests(unittest.TestCase):
    def setUp(self):
        store.reset_for_tests()

    def test_ac07_lists_inventory_and_filters_exact_wbs(self):
        self.assertEqual(3, len(service.list_inventory()))
        filtered = service.list_inventory("IM24-001")
        self.assertEqual(1, len(filtered))
        self.assertEqual(100, filtered[0]["quantity"])

    def test_ac08_completes_shipment_and_deducts_stock(self):
        shipment = self._ship(quantity=12)

        self.assertEqual("COMPLETED", shipment["status"])
        self.assertEqual("221", shipment["movement_type"])
        self.assertEqual(88, shipment["stock_after"])
        self.assertEqual(88, service.list_inventory("IM24-001")[0]["quantity"])

    def test_ac09_insufficient_stock_changes_nothing(self):
        with self.assertRaisesRegex(engine.IpsError, "재고가 부족"):
            self._ship(quantity=101)

        self.assertEqual(100, service.list_inventory("IM24-001")[0]["quantity"])
        self.assertEqual([], service.list_shipments())

    def test_ac10_duplicate_request_changes_nothing(self):
        self._ship(quantity=10)

        with self.assertRaisesRegex(engine.IpsError, "이미 처리된 출고 요청 번호"):
            self._ship(quantity=10)

        self.assertEqual(90, service.list_inventory("IM24-001")[0]["quantity"])
        self.assertEqual(1, len(service.list_shipments()))

    def test_ac11_cancel_restores_full_quantity(self):
        shipment = self._ship(quantity=12)
        canceled = service.cancel_shipment(shipment["shipment_id"], "H0002")

        self.assertEqual("CANCELED", canceled["status"])
        self.assertEqual("222", canceled["cancel_movement_type"])
        self.assertEqual("H0002", canceled["canceled_by"])
        self.assertEqual(100, canceled["stock_after"])
        self.assertEqual(100, service.list_inventory("IM24-001")[0]["quantity"])

    def test_ac12_second_cancel_changes_nothing(self):
        shipment = self._ship(quantity=12)
        service.cancel_shipment(shipment["shipment_id"], "H0002")

        with self.assertRaisesRegex(engine.IpsError, "이미 취소된 출고"):
            service.cancel_shipment(shipment["shipment_id"], "H0002")

        self.assertEqual(100, service.list_inventory("IM24-001")[0]["quantity"])

    def test_ac13_presales_wbs_uses_matching_movement_types(self):
        shipment = self._ship(
            request_id="GI-002",
            material_code="A39439-00004567",
            storage_location="1M11",
            wbs="R2-00-100",
            quantity=3,
        )
        canceled = service.cancel_shipment(shipment["shipment_id"], "H0002")

        self.assertEqual("M75", shipment["movement_type"])
        self.assertEqual("M76", canceled["cancel_movement_type"])

    def test_unknown_inventory_and_shipment_are_rejected(self):
        with self.assertRaisesRegex(engine.IpsError, "일치하는 재고"):
            self._ship(material_code="UNKNOWN")
        with self.assertRaisesRegex(engine.IpsError, "출고 내역을 찾을 수 없습니다"):
            service.cancel_shipment(999, "H0001")

    def _ship(
        self,
        request_id="GI-001",
        material_code="A39439-00001213",
        plant="7311",
        storage_location="1M01",
        wbs="IM24-001",
        quantity=10,
        user_id="H0001",
    ):
        return service.create_shipment(
            request_id,
            material_code,
            plant,
            storage_location,
            wbs,
            quantity,
            user_id,
        )


if __name__ == "__main__":
    unittest.main()

