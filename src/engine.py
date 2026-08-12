"""사내추첨 MVP 핵심 업무 규칙.

화면과 API에서 규칙을 중복 구현하지 않도록 입력 정리, 검증, 추첨을
순수 함수로 분리한다. 테스트에서는 seed를 전달해 결과를 재현한다.
"""

import random
import secrets

from data import MAX_PARTICIPANTS


class LotteryError(ValueError):
    """사용자가 수정할 수 있는 추첨 입력 오류."""


def normalize_participants(raw_text: str) -> tuple[list[str], int]:
    """고유 참여자 목록과 제거된 중복 수를 반환한다.

    - 각 줄의 앞뒤 공백을 제거한다.
    - 빈 줄을 제외한다.
    - 완전히 같은 이름은 첫 번째만 유지한다.
    - 영문 대소문자는 구분한다.
    """

    participants: list[str] = []
    seen: set[str] = set()
    duplicate_count = 0

    for raw_name in (raw_text or "").splitlines():
        name = raw_name.strip()
        if not name:
            continue
        if name in seen:
            duplicate_count += 1
            continue
        seen.add(name)
        participants.append(name)

    return participants, duplicate_count


def draw_winners(
    raw_text: str,
    winner_count: int,
    seed: int | None = None,
) -> dict:
    """입력을 검증하고 중복 없는 당첨 결과 요약을 반환한다."""

    participants, duplicate_count = normalize_participants(raw_text)

    if not participants:
        raise LotteryError("참여자를 1명 이상 입력해 주세요.")
    if len(participants) > MAX_PARTICIPANTS:
        raise LotteryError("참여자는 1,000명 이하로 입력해 주세요.")
    if winner_count < 1:
        raise LotteryError("당첨자 수는 1명 이상이어야 합니다.")
    if winner_count > len(participants):
        raise LotteryError("당첨자 수는 참여자 수보다 많을 수 없습니다.")

    rng = random.Random(seed) if seed is not None else secrets.SystemRandom()
    winners = rng.sample(participants, winner_count)

    return {
        "participant_count": len(participants),
        "duplicate_count": duplicate_count,
        "winner_count": winner_count,
        "winners": winners,
    }
