// frontend/src/components/ResultView.js
import React from "react";

export default function ResultView({ result }) {
  if (!result) return null;

  if (result.status === "PENDING_APPROVAL") {
    return (
      <div style={{ marginTop: 20 }}>
        <h3>Reconciliation Preview (Waiting for Your Approval)</h3>
        <p>
          Sample rows and suggested column mappings are shown above.
          Review them, adjust mappings, and click
          &nbsp;<b>Approve &amp; Run Reconciliation</b>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Reconciliation Result</h3>
      <pre style={{ maxHeight: 400, overflow: "auto" }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
