"""사내추첨 구현스펙 AC-01~AC-08, AC-10 단위 테스트."""

import sys
import unittest
from pathlib import Path


SRC_DIR = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC_DIR))

from engine import LotteryError, draw_winners, normalize_participants


class NormalizeParticipantsTests(unittest.TestCase):
    def test_ac01_trims_and_removes_blank_lines(self):
        participants, duplicate_count = normalize_participants(
            "  김한화  \n\n이태양\n   "
        )

        self.assertEqual(["김한화", "이태양"], participants)
        self.assertEqual(0, duplicate_count)

    def test_ac02_removes_duplicates_in_order(self):
        participants, duplicate_count = normalize_participants(
            "김한화\n이태양\n김한화\n박도전\n이태양"
        )

        self.assertEqual(["김한화", "이태양", "박도전"], participants)
        self.assertEqual(2, duplicate_count)

    def test_ac03_keeps_case_distinct(self):
        participants, duplicate_count = normalize_participants("Kim\nkim\nKim")

        self.assertEqual(["Kim", "kim"], participants)
        self.assertEqual(1, duplicate_count)


class DrawWinnersTests(unittest.TestCase):
    def test_ac04_rejects_empty_participants(self):
        with self.assertRaisesRegex(LotteryError, "참여자를 1명 이상 입력해 주세요."):
            draw_winners("  \n\n ", 1, seed=42)

    def test_ac05_rejects_winner_count_below_one(self):
        with self.assertRaisesRegex(LotteryError, "당첨자 수는 1명 이상이어야 합니다."):
            draw_winners("김한화\n이태양", 0, seed=42)

    def test_ac06_rejects_too_many_winners(self):
        with self.assertRaisesRegex(
            LotteryError,
            "당첨자 수는 참여자 수보다 많을 수 없습니다.",
        ):
            draw_winners("김한화\n이태양\n김한화", 3, seed=42)

    def test_ac07_returns_unique_valid_winners(self):
        participants = {"김한화", "이태양", "박도전", "최미래"}
        result = draw_winners("\n".join(participants), 3, seed=7)

        self.assertEqual(3, len(result["winners"]))
        self.assertEqual(3, len(set(result["winners"])))
        self.assertTrue(set(result["winners"]).issubset(participants))

    def test_ac08_same_seed_reproduces_winners(self):
        raw_text = "김한화\n이태양\n박도전\n최미래"

        first = draw_winners(raw_text, 2, seed=42)
        second = draw_winners(raw_text, 2, seed=42)

        self.assertEqual(first["winners"], second["winners"])

    def test_ac10_rejects_more_than_1000_people(self):
        raw_text = "\n".join(f"참여자-{index}" for index in range(1_001))

        with self.assertRaisesRegex(LotteryError, "참여자는 1,000명 이하로 입력해 주세요."):
            draw_winners(raw_text, 1, seed=42)


if __name__ == "__main__":
    unittest.main()

