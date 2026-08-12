"""현재 프로세스에서만 유지되는 추첨 실행 이력."""

import itertools
from datetime import datetime, timezone


_history: list[dict] = []
_id_sequence = itertools.count(1)


def record_draw(result: dict) -> dict:
    """성공한 추첨 결과에 ID와 시각을 붙이고 메모리에 기록한다."""

    event = {
        "draw_id": next(_id_sequence),
        "drawn_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        **result,
    }
    _history.append(event)
    return dict(event)


def list_draws(limit: int = 20) -> list[dict]:
    """최근 추첨부터 지정 개수만큼 반환한다."""

    safe_limit = max(0, min(limit, 100))
    if safe_limit == 0:
        return []
    return [dict(event) for event in reversed(_history[-safe_limit:])]


def reset_for_tests() -> None:
    """테스트 간 메모리 상태와 ID를 초기화한다."""

    global _id_sequence
    _history.clear()
    _id_sequence = itertools.count(1)
