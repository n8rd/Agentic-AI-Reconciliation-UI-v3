// src/api/index.js (or similar)
const API_BASE =
  process.env.REACT_APP_API_BASE || "https://recon-backend-947423379682.us-central1.run.app";
export async function callRecon(formData) {
  const res = await fetch(`${API_BASE}/reconcile`, {
    method: "POST",
    body: formData, // DO NOT manually set Content-Type here
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reconcile failed: ${res.status} ${text}`);
  }

  return res.json();
}
