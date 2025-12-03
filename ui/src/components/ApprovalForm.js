// frontend/src/components/ApprovalForm.js
import React, { useState } from "react";
import { approveRecon } from "../api";

export default function ApprovalForm({ pendingState, onApproved }) {
  // Initialise local state from backend suggestions
  const [mappings, setMappings] = useState(
    pendingState.schema_mapping.matches.map((m) => ({
      ...m,
      // auto-select higher confidence mappings if you like
      approved: m.confidence >= 0.5,
    }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleApproved = (index) => {
    setMappings((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, approved: !m.approved } : m
      )
    );
  };

  const handleSubmit = async () => {
    console.log("[ApprovalForm] Approve clicked");
    setError("");
    setLoading(true);
    try {
      const approved_matches = mappings
        .filter((m) => m.approved)
        .map(({ a_col, b_col }) => ({ a_col, b_col }));

      if (approved_matches.length === 0) {
        setError("Select at least one column mapping to proceed.");
        setLoading(false);
        return;
      }

      const { dataset_a, dataset_b, thresholds, entities } = pendingState;

      const payload = {
        dataset_a,
        dataset_b,
        thresholds,
        entities,
        approval: {
          approved_matches, // matches Approval.approved_matches in backend
        },
      };

      console.log("[ApprovalForm] Payload for /reconcile/approve:", payload);

      const finalResult = await approveRecon(payload);

      console.log(
        "[ApprovalForm] Final result from backend /reconcile/approve:",
        finalResult
      );
      onApproved(finalResult);
    } catch (e) {
      console.error("[ApprovalForm] Error in approval flow:", e);
      setError("Failed to run reconciliation with approvals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20, padding: 12, border: "1px solid #ccc" }}>
      <h3>Step 2: Approve Column Mappings</h3>

      <table
        style={{ borderCollapse: "collapse", marginTop: 10, width: "100%" }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Use?</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>
              Dataset A column
            </th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>
              Dataset B column
            </th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>
              Confidence
            </th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m, idx) => (
            <tr key={`${m.a_col}-${m.b_col}-${idx}`}>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                <input
                  type="checkbox"
                  checked={m.approved}
                  onChange={() => toggleApproved(idx)}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {m.a_col}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {m.b_col}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {m.confidence.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: show sample data for context */}
      <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>Dataset A Sample</h4>
          <pre style={{ maxHeight: 200, overflow: "auto" }}>
            {JSON.stringify(pendingState.df_a_sample, null, 2)}
          </pre>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Dataset B Sample</h4>
          <pre style={{ maxHeight: 200, overflow: "auto" }}>
            {JSON.stringify(pendingState.df_b_sample, null, 2)}
          </pre>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: "red" }}>
          {error}
        </div>
      )}

      <button
        type="button"              {/* important so it never triggers a form submit */}
        style={{ marginTop: 12 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Running reconciliation..." : "Approve & Run Reconciliation"}
      </button>
    </div>
  );
}
