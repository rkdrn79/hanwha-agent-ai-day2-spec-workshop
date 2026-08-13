const byId = (id) => document.getElementById(id);

const API = Object.freeze({
  inventory: "/api/inventory",
  shipments: "/api/shipments",
  reset: "/api/demo/reset",
});

async function api(path, options = {}) {
  // TODO: JSON 응답과 HTTP 오류 detail을 처리하세요.
  throw new Error("TODO: API 호출을 구현하세요.");
}

function setMessage(text, kind = "info") {
  // TODO: success/error/info 상태를 화면에 표시하세요.
  byId("message").textContent = text;
}

function setBusy(isBusy) {
  // TODO: 요청 중 버튼 중복 클릭을 방지하세요.
}

async function loadInventory() {
  // TODO: WBS 필터를 반영하고 재고 행·선택 버튼을 렌더링하세요.
}

async function loadShipments() {
  // TODO: 출고 이력·상태 배지·취소 버튼을 렌더링하세요.
}

async function createShipment(event) {
  // TODO: 폼 payload를 만들고 출고 API를 호출하세요.
  event.preventDefault();
}

async function cancelShipment(shipmentId) {
  // TODO: 완료 건 전체 취소와 화면 새로고침을 구현하세요.
}

async function resetDemo() {
  // TODO: 데모 초기화 후 폼·재고·이력을 시작 상태로 돌리세요.
}

async function refresh() {
  await Promise.all([loadInventory(), loadShipments()]);
}

byId("shipmentForm").addEventListener("submit", createShipment);
byId("filterButton").addEventListener("click", loadInventory);
byId("resetButton").addEventListener("click", resetDemo);

setMessage("Frontend Worktree에서 API 연동을 구현하세요.");

