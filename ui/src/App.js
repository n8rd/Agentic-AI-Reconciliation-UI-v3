// frontend/src/App.js
import React, { useState } from "react";
import ReconcileForm from "./components/ReconcileForm";
import ResultView from "./components/ResultView";
import ApprovalForm from "./components/ApprovalForm";

export default function App() {
  // Single source of truth for whatever the backend last returned
  const [result, setResult] = useState(null);

  const handleReconcileResult = (res) => {
    console.log("[App] Received result from /reconcile:", res);
    setResult(res); // typically this will have status: "PENDING_APPROVAL"
  };

  const handleApprovedResult = (res) => {
    console.log("[App] Received final result from /reconcile/approve:", res);
    setResult(res); // overwrite with final state (e.g. status: "COMPLETED")
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Agentic AI Reconciliation</h2>

      {/* Step 1: configuration + initial run */}
      <ReconcileForm setResult={handleReconcileResult} />

      {/* Step 2: approval UI if backend says PENDING_APPROVAL */}
      {result && result.status === "PENDING_APPROVAL" && (
        <ApprovalForm
          pendingState={result}
          onApproved={handleApprovedResult}
        />
      )}

      {/* Step 3: show whatever the latest result is */}
      <ResultView result={result} />
    </div>
  );
}
