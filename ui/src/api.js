/*const API_BASE =
  process.env.REACT_APP_API_BASE || "https://recon-backend-947423379682.us-central1.run.app/api";
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
*/

// src/api.js

// Use your actual backend URL here:
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://recon-backend-947423379682.us-central1.run.app/api";

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

