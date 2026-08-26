"""입력, 이동유형, 재고 검증 규칙 단위 테스트."""

import sys
import unittest
from pathlib import Path


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

import engine


class OutboundInputTests(unittest.TestCase):
    def test_ac01_trims_and_accepts_valid_input(self):
        result = engine.validate_outbound_input(
            " GI-001 ", " MAT-01 ", " 7311 ", " 1M01 ", " IM24-001 ", 3, " H0001 "
        )

        self.assertEqual("GI-001", result["request_id"])
        self.assertEqual("MAT-01", result["material_code"])
        self.assertEqual("H0001", result["user_id"])
        self.assertEqual(3, result["quantity"])

    def test_ac02_rejects_blank_required_value(self):
        with self.assertRaisesRegex(engine.IpsError, "출고 요청 번호.*필수"):
            engine.validate_outbound_input(
                " ", "MAT-01", "7311", "1M01", "IM24-001", 3, "H0001"
            )

    def test_ac03_rejects_non_positive_quantity(self):
        with self.assertRaisesRegex(engine.IpsError, "출고 수량은 1 이상"):
            engine.validate_outbound_input(
                "GI-001", "MAT-01", "7311", "1M01", "IM24-001", 0, "H0001"
            )


class MovementTypeTests(unittest.TestCase):
    def test_ac04_uses_standard_types_for_general_wbs(self):
        self.assertEqual(("221", "222"), engine.movement_types("IM24-001"))

    def test_ac04_uses_presales_types_for_r2_00(self):
        self.assertEqual(("M75", "M76"), engine.movement_types("r2-00-100"))

    def test_ac04_uses_warranty_types_for_r2_01(self):
        self.assertEqual(("M77", "M78"), engine.movement_types("R2-01-200"))


class StockRuleTests(unittest.TestCase):
    def test_ac05_rejects_quantity_over_available_stock(self):
        with self.assertRaisesRegex(engine.IpsError, "현재 재고: 8, 요청 수량: 9"):
            engine.validate_available_stock(8, 9)

    def test_ac06_rejects_already_canceled_shipment(self):
        with self.assertRaisesRegex(engine.IpsError, "이미 취소된 출고"):
            engine.validate_cancel_status(engine.STATUS_CANCELED)


if __name__ == "__main__":
    unittest.main()

