import React, { useState } from "react";
import ReconcileForm from "./components/ReconcileForm";
import ResultView from "./components/ResultView";

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h2>Agentic AI Reconciliation v3</h2>
      <ReconcileForm setResult={setResult} />
      <ResultView result={result} />
    </div>
  );
}

// frontend/src/App.js
import React, { useState } from "react";
import ReconcileForm from "./components/ReconcileForm";
import ResultView from "./components/ResultView";
import ApprovalForm from "./components/ApprovalForm";

export default function App() {
  const [pendingResult, setPendingResult] = useState(null); // first step result
  const [finalResult, setFinalResult] = useState(null);     // after approval

  const handleReconcileResult = (res) => {
    // when user hits "Run reconciliation" in ReconcileForm
    setFinalResult(null);     // reset any previous final result
    setPendingResult(res);    // store the PENDING_APPROVAL state
  };

  const effectiveResult = finalResult || pendingResult;

  return (
    <div style={{ padding: 20 }}>
      <h2>Agentic AI Reconciliation v3</h2>

      {/* Step 1: configuration + initial run */}
      <ReconcileForm setResult={handleReconcileResult} />

      {/* Step 2: approval UI if backend says PENDING_APPROVAL */}
      {pendingResult && pendingResult.status === "PENDING_APPROVAL" && (
        <ApprovalForm
          pendingState={pendingResult}
          onApproved={(res) => {
            setFinalResult(res);
            setPendingResult(res); // so ResultView sees the final status
          }}
        />
      )}

      {/* Step 3: display final result (and optionally also show for PENDING_APPROVAL) */}
      <ResultView result={effectiveResult} />
    </div>
  );
}

