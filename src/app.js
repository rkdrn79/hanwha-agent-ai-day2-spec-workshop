const byId = (id) => document.getElementById(id);

const API = Object.freeze({
  inventory: "/api/inventory",
  shipments: "/api/shipments",
  reset: "/api/demo/reset",
});

let requestInFlight = false;

function detailToMessage(detail, status) {
  if (typeof detail === "string" && detail.trim() !== "") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (item && typeof item === "object") {
          const loc = Array.isArray(item.loc) ? item.loc.join(".") : "";
          const msg = typeof item.msg === "string" ? item.msg : "";
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter((part) => part !== "");
    if (parts.length > 0) {
      return `요청 형식이 올바르지 않습니다. ${parts.join(" / ")}`;
    }
  }
  return `요청이 실패했습니다. (HTTP ${status})`;
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    throw new Error("서버에 연결할 수 없습니다. 서버 실행 상태를 확인해 주세요.");
  }

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (!response.ok) {
    const detail = body && typeof body === "object" ? body.detail : null;
    throw new Error(detailToMessage(detail, response.status));
  }
  return body;
}

function setMessage(text, kind = "info") {
  const message = byId("message");
  message.textContent = text;
  message.className = `message message--${kind}`;
}

function setBusy(isBusy) {
  requestInFlight = isBusy;
  const staticButtons = [byId("submitButton"), byId("filterButton"), byId("resetButton")];
  const dynamicButtons = document.querySelectorAll(".select-button, .cancel-button");
  for (const button of staticButtons) {
    if (button) button.disabled = isBusy;
  }
  for (const button of dynamicButtons) {
    button.disabled = isBusy;
  }
}

function clearSelectedRows() {
  for (const row of document.querySelectorAll("#inventoryBody tr.is-selected")) {
    row.classList.remove("is-selected");
  }
}

function selectInventoryItem(item, row) {
  byId("materialCode").value = item.material_code;
  byId("plant").value = item.plant;
  byId("storageLocation").value = item.storage_location;
  byId("wbs").value = item.wbs;
  clearSelectedRows();
  row.classList.add("is-selected");
  setMessage(
    `재고를 선택했습니다: ${item.material_code} (WBS ${item.wbs}). 수량을 입력하고 출고를 처리하세요.`,
    "info"
  );
}

function renderEmptyRow(tbody, colspan, text) {
  tbody.textContent = "";
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colspan;
  cell.className = "empty";
  cell.textContent = text;
  row.appendChild(cell);
  tbody.appendChild(row);
}

async function loadInventory() {
  const tbody = byId("inventoryBody");
  const wbs = byId("wbsFilter").value.trim();
  const path = wbs ? `${API.inventory}?wbs=${encodeURIComponent(wbs)}` : API.inventory;

  renderEmptyRow(tbody, 6, "재고를 불러오는 중입니다...");
  try {
    const data = await api(path);
    const items = Array.isArray(data.inventory) ? data.inventory : [];
    if (items.length === 0) {
      renderEmptyRow(tbody, 6, wbs ? `WBS "${wbs}"와 일치하는 재고가 없습니다.` : "조회된 재고가 없습니다.");
      return;
    }

    tbody.textContent = "";
    const selectedWbs = byId("wbs").value;
    const selectedMaterial = byId("materialCode").value;
    const selectedPlant = byId("plant").value;
    const selectedLocation = byId("storageLocation").value;

    for (const item of items) {
      const row = document.createElement("tr");

      const materialCell = document.createElement("td");
      const codeLine = document.createElement("strong");
      codeLine.textContent = item.material_code;
      const nameLine = document.createElement("div");
      nameLine.textContent = item.material_name;
      materialCell.appendChild(codeLine);
      materialCell.appendChild(nameLine);
      row.appendChild(materialCell);

      for (const value of [item.plant, item.storage_location, item.wbs]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      }

      const quantityCell = document.createElement("td");
      quantityCell.textContent = `${item.quantity} ${item.unit}`;
      row.appendChild(quantityCell);

      const actionCell = document.createElement("td");
      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "select-button";
      selectButton.textContent = "선택";
      selectButton.addEventListener("click", () => selectInventoryItem(item, row));
      actionCell.appendChild(selectButton);
      row.appendChild(actionCell);

      if (
        selectedMaterial &&
        item.material_code === selectedMaterial &&
        item.plant === selectedPlant &&
        item.storage_location === selectedLocation &&
        item.wbs === selectedWbs
      ) {
        row.classList.add("is-selected");
      }

      tbody.appendChild(row);
    }
  } catch (error) {
    renderEmptyRow(tbody, 6, "재고 조회에 실패했습니다.");
    setMessage(error.message, "error");
  }
}

async function loadShipments() {
  const tbody = byId("shipmentBody");
  renderEmptyRow(tbody, 7, "출고 이력을 불러오는 중입니다...");
  try {
    const data = await api(API.shipments);
    const shipments = Array.isArray(data.shipments) ? data.shipments : [];
    if (shipments.length === 0) {
      renderEmptyRow(tbody, 7, "아직 처리된 출고가 없습니다.");
      return;
    }

    tbody.textContent = "";
    for (const shipment of shipments) {
      const row = document.createElement("tr");
      const isCanceled = shipment.status === "CANCELED";

      const idCell = document.createElement("td");
      idCell.textContent = String(shipment.shipment_id);
      row.appendChild(idCell);

      const requestCell = document.createElement("td");
      requestCell.textContent = shipment.request_id;
      row.appendChild(requestCell);

      const materialCell = document.createElement("td");
      const codeLine = document.createElement("strong");
      codeLine.textContent = shipment.material_code;
      const wbsLine = document.createElement("div");
      wbsLine.textContent = `WBS ${shipment.wbs}`;
      materialCell.appendChild(codeLine);
      materialCell.appendChild(wbsLine);
      row.appendChild(materialCell);

      const quantityCell = document.createElement("td");
      quantityCell.textContent = `${shipment.quantity} ${shipment.unit}`;
      row.appendChild(quantityCell);

      const movementCell = document.createElement("td");
      movementCell.textContent =
        isCanceled && shipment.cancel_movement_type
          ? `${shipment.movement_type} → ${shipment.cancel_movement_type}`
          : shipment.movement_type;
      row.appendChild(movementCell);

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `status-badge status-badge--${isCanceled ? "canceled" : "completed"}`;
      badge.textContent = shipment.status;
      statusCell.appendChild(badge);
      row.appendChild(statusCell);

      const actionCell = document.createElement("td");
      if (shipment.status === "COMPLETED") {
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel-button";
        cancelButton.textContent = "전체 취소";
        cancelButton.addEventListener("click", () => cancelShipment(shipment.shipment_id));
        actionCell.appendChild(cancelButton);
      } else {
        const canceledInfo = document.createElement("div");
        canceledInfo.textContent = `취소자 ${shipment.canceled_by ?? "-"}`;
        const canceledAt = document.createElement("div");
        canceledAt.textContent = shipment.canceled_at ?? "-";
        actionCell.appendChild(canceledInfo);
        actionCell.appendChild(canceledAt);
      }
      row.appendChild(actionCell);

      tbody.appendChild(row);
    }
  } catch (error) {
    renderEmptyRow(tbody, 7, "출고 이력 조회에 실패했습니다.");
    setMessage(error.message, "error");
  }
}

async function createShipment(event) {
  event.preventDefault();
  if (requestInFlight) return;

  const payload = {
    request_id: byId("requestId").value.trim(),
    material_code: byId("materialCode").value.trim(),
    plant: byId("plant").value.trim(),
    storage_location: byId("storageLocation").value.trim(),
    wbs: byId("wbs").value.trim(),
    quantity: Number(byId("quantity").value),
    user_id: byId("userId").value.trim(),
  };

  setBusy(true);
  try {
    const record = await api(API.shipments, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMessage(
      `출고가 완료되었습니다. (요청 ${record.request_id}, 이동유형 ${record.movement_type}, 출고 직후 잔량 ${record.stock_after} ${record.unit})`,
      "success"
    );
    await refresh();
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function cancelShipment(shipmentId) {
  if (requestInFlight) return;

  setBusy(true);
  try {
    const record = await api(`${API.shipments}/${shipmentId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: byId("userId").value.trim() }),
    });
    setMessage(
      `출고 ${record.shipment_id}건이 전체 취소되었습니다. (취소 이동유형 ${record.cancel_movement_type})`,
      "success"
    );
    await refresh();
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function resetDemo() {
  if (requestInFlight) return;

  setBusy(true);
  try {
    await api(API.reset, { method: "POST" });
    byId("requestId").value = "GI-001";
    byId("userId").value = "H0001";
    byId("quantity").value = 1;
    byId("materialCode").value = "";
    byId("plant").value = "";
    byId("storageLocation").value = "";
    byId("wbs").value = "";
    byId("wbsFilter").value = "";
    clearSelectedRows();
    await refresh();
    setMessage("데모가 초기화되었습니다. 재고를 선택해 출고를 시작하세요.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function refresh() {
  await Promise.all([loadInventory(), loadShipments()]);
}

byId("shipmentForm").addEventListener("submit", createShipment);
byId("filterButton").addEventListener("click", loadInventory);
byId("resetButton").addEventListener("click", resetDemo);

setMessage("재고 목록에서 항목을 선택한 뒤 수량을 입력해 출고를 처리하세요.", "info");
refresh();
