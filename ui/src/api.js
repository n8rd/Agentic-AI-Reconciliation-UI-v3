// Use your actual backend URL here:
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://agentic-ai-reconciliation-backend-v3-947423379682.us-central1.run.app/api";

export async function callRecon(payloadOrFormData, useFiles = false) {
  const options = useFiles
    ? { method: "POST", body: payloadOrFormData }
    : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadOrFormData),
      };

  const res = await fetch(`${API_BASE_URL}/reconcile`, options);

  if (!res.ok) {
    const text = await res.text();
    console.error("Reconciliation error:", res.status, text);
    throw new Error(`Reconcile failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function approveRecon(payload) {
  // second step: continue graph with approval info
  const resp = await fetch("/reconcile/approve", {
    // again, adjust path if your backend is /api/reconcile/approve
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error("Approval reconciliation request failed");
  return resp.json();
}

