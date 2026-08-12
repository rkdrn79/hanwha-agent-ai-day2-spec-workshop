"""미니 IPS API 전체 흐름 통합 테스트."""

import sys
import unittest
from pathlib import Path


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from fastapi.testclient import TestClient

import store
from app import app


class IpsApiTests(unittest.TestCase):
    def setUp(self):
        store.reset_for_tests()
        self.client = TestClient(app)

    def test_complete_inventory_outbound_cancel_flow(self):
        before = self.client.get("/api/inventory?wbs=IM24-001").json()["inventory"][0]
        self.assertEqual(100, before["quantity"])

        created = self.client.post("/api/shipments", json=self._payload(quantity=15))
        self.assertEqual(200, created.status_code)
        shipment = created.json()
        self.assertEqual(85, shipment["stock_after"])

        canceled = self.client.post(
            f"/api/shipments/{shipment['shipment_id']}/cancel",
            json={"user_id": "H0002"},
        )
        self.assertEqual(200, canceled.status_code)
        self.assertEqual("CANCELED", canceled.json()["status"])
        self.assertEqual(100, canceled.json()["stock_after"])

    def test_insufficient_stock_returns_400_without_history(self):
        response = self.client.post("/api/shipments", json=self._payload(quantity=101))

        self.assertEqual(400, response.status_code)
        self.assertIn("재고가 부족", response.json()["detail"])
        self.assertEqual([], self.client.get("/api/shipments").json()["shipments"])

    def test_duplicate_request_returns_400(self):
        self.client.post("/api/shipments", json=self._payload(quantity=10))
        response = self.client.post("/api/shipments", json=self._payload(quantity=10))

        self.assertEqual(400, response.status_code)
        self.assertIn("이미 처리된", response.json()["detail"])

    def test_unknown_shipment_returns_400(self):
        response = self.client.post(
            "/api/shipments/999/cancel",
            json={"user_id": "H0001"},
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual("출고 내역을 찾을 수 없습니다.", response.json()["detail"])

    def _payload(self, quantity=10):
        return {
            "request_id": "GI-001",
            "material_code": "A39439-00001213",
            "plant": "7311",
            "storage_location": "1M01",
            "wbs": "IM24-001",
            "quantity": quantity,
            "user_id": "H0001",
        }


if __name__ == "__main__":
    unittest.main()
