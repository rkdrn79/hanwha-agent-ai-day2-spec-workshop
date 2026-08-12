"""사내추첨 MVP API 서버와 단일 화면."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

import engine
import store


BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="사내추첨 MVP", version="1.0.0")


class DrawRequest(BaseModel):
    participants: str
    winner_count: int
    seed: int | None = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/draw")
def api_draw(request: DrawRequest):
    try:
        result = engine.draw_winners(
            request.participants,
            request.winner_count,
            request.seed,
        )
    except engine.LotteryError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return store.record_draw(result)


@app.get("/api/history")
def api_history(limit: int = 20):
    return {"draws": store.list_draws(limit)}


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
