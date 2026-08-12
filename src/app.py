"""IPS WBS 출고·취소 MVP API와 단일 화면."""

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

import engine
import service


BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="IPS WBS 출고·취소 MVP", version="1.0.0")


class ShipmentRequest(BaseModel):
    request_id: str
    material_code: str
    plant: str
    storage_location: str
    wbs: str
    quantity: int
    user_id: str


class CancelRequest(BaseModel):
    user_id: str


def _run(action):
    try:
        return action()
    except engine.IpsError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/inventory")
def api_inventory(wbs: str | None = Query(default=None)):
    return {"inventory": service.list_inventory(wbs)}


@app.post("/api/shipments")
def api_create_shipment(request: ShipmentRequest):
    return _run(lambda: service.create_shipment(**request.model_dump()))


@app.get("/api/shipments")
def api_shipments():
    return {"shipments": service.list_shipments()}


@app.get("/api/shipments/{shipment_id}")
def api_shipment(shipment_id: int):
    return _run(lambda: service.get_shipment(shipment_id))


@app.post("/api/shipments/{shipment_id}/cancel")
def api_cancel_shipment(shipment_id: int, request: CancelRequest):
    return _run(lambda: service.cancel_shipment(shipment_id, request.user_id))


@app.post("/api/demo/reset")
def api_reset_demo():
    return service.reset_demo()


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
