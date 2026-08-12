"""사내추첨 구현스펙 AC-09와 API 오류 통합 테스트."""

import sys
import unittest
from pathlib import Path


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from fastapi.testclient import TestClient

import store
from app import app


class LotteryApiTests(unittest.TestCase):
    def setUp(self):
        store.reset_for_tests()
        self.client = TestClient(app)

    def test_ac09_returns_summary_and_history(self):
        response = self.client.post(
            "/api/draw",
            json={
                "participants": "김한화\n이태양\n김한화\n박도전",
                "winner_count": 2,
                "seed": 42,
            },
        )

        self.assertEqual(200, response.status_code)
        result = response.json()
        self.assertEqual(1, result["draw_id"])
        self.assertEqual(3, result["participant_count"])
        self.assertEqual(1, result["duplicate_count"])
        self.assertEqual(2, result["winner_count"])
        self.assertEqual(2, len(result["winners"]))
        self.assertIn("drawn_at", result)

        history_response = self.client.get("/api/history")
        self.assertEqual(200, history_response.status_code)
        draws = history_response.json()["draws"]
        self.assertEqual(1, len(draws))
        self.assertEqual(result["draw_id"], draws[0]["draw_id"])
        self.assertEqual(result["winners"], draws[0]["winners"])

    def test_failed_draw_is_not_added_to_history(self):
        response = self.client.post(
            "/api/draw",
            json={"participants": "김한화\n이태양", "winner_count": 3},
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual(
            "당첨자 수는 참여자 수보다 많을 수 없습니다.",
            response.json()["detail"],
        )
        self.assertEqual([], self.client.get("/api/history").json()["draws"])

    def test_history_limit_zero_returns_no_items(self):
        self.client.post(
            "/api/draw",
            json={"participants": "김한화\n이태양", "winner_count": 1, "seed": 42},
        )

        response = self.client.get("/api/history?limit=0")

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json()["draws"])


if __name__ == "__main__":
    unittest.main()
