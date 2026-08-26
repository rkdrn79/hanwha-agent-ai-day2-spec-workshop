"""Frontend 정적 파일과 Backend API 계약의 최소 통합 검증."""

import sys
import unittest
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT_DIR / "src"
sys.path.insert(0, str(SRC_DIR))

from fastapi.testclient import TestClient

from app import app


class FrontendContractTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_page_and_static_assets_are_served(self):
        page = self.client.get("/")
        styles = self.client.get("/styles.css")
        script = self.client.get("/app.js")

        self.assertEqual(200, page.status_code)
        self.assertEqual(200, styles.status_code)
        self.assertEqual(200, script.status_code)
        self.assertIn('/styles.css', page.text)
        self.assertIn('/app.js', page.text)

    def test_page_exposes_inventory_outbound_and_history_controls(self):
        page = self.client.get("/").text

        for required_id in (
            'inventoryBody',
            'wbsFilter',
            'shipmentForm',
            'submitButton',
            'message',
            'shipmentBody',
            'resetButton',
        ):
            self.assertIn(f'id="{required_id}"', page)

    def test_frontend_todo_is_removed_in_completed_mvp(self):
        script = (SRC_DIR / "app.js").read_text(encoding="utf-8")
        styles = (SRC_DIR / "styles.css").read_text(encoding="utf-8")

        self.assertNotIn("TODO", script)
        self.assertNotIn("TODO", styles)


if __name__ == "__main__":
    unittest.main()

