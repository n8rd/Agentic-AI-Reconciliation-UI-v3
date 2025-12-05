// frontend/src/components/ApprovalForm.js
import React, { useState, useMemo } from "react";
import { approveRecon } from "../api";
import "./ApprovalForm.css";

export default function ApprovalForm({ pendingState, onApproved }) {
  const initialMatches = pendingState.schema_mapping?.matches || [];

  const [mappings, setMappings] = useState(
    initialMatches.map((m) => ({
      ...m,
      // auto-approve anything over 0.5 confidence
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
          approved_matches,
        },
      };

      console.log(
        "[ApprovalForm] Payload for /reconcile/approve:",
        payload
      );

      const finalResult = await approveRecon(payload);
      console.log(
        "[ApprovalForm] Final result from /reconcile/approve:",
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

  // Samples (if backend sends them)
  const dfASample = pendingState.df_a_sample;
  const dfBSample = pendingState.df_b_sample;

  // Unmapped columns based on columns_a / columns_b vs matches
  const { unmappedA, unmappedB } = useMemo(() => {
    const colsA = pendingState.columns_a || [];
    const colsB = pendingState.columns_b || [];
    const usedA = new Set(initialMatches.map((m) => m.a_col));
    const usedB = new Set(initialMatches.map((m) => m.b_col));

    return {
      unmappedA: colsA.filter((c) => !usedA.has(c)),
      unmappedB: colsB.filter((c) => !usedB.has(c)),
    };
  }, [pendingState.columns_a, pendingState.columns_b, initialMatches]);

  return (
    <div className="af-root">
      <div className="af-header">
        <div>
          <h3 className="af-title">Step 2 · Approve column mappings</h3>
          <p className="af-subtitle">
            Review suggested column pairs, select which ones to apply, then run
            full reconciliation.
          </p>
        </div>
        <span className="af-pill">Pending approval</span>
      </div>

      {/* Mappings table */}
      <div className="af-table-wrapper">
        <table className="af-table">
          <thead>
            <tr>
              <th className="af-col-use">Use?</th>
              <th>Dataset A column</th>
              <th>Dataset B column</th>
              <th className="af-col-type">Type</th>
              <th className="af-col-confidence">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, idx) => (
              <tr key={`${m.a_col}-${m.b_col}-${idx}`}>
                <td className="af-col-use">
                  <input
                    type="checkbox"
                    checked={!!m.approved}
                    onChange={() => toggleApproved(idx)}
                  />
                </td>
                <td>{m.a_col}</td>
                <td>{m.b_col}</td>
                <td className="af-col-type">
                  {m.type ? (
                    <span className={`af-type-pill af-type-${m.type}`}>
                      {m.type}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="af-col-confidence">
                  {m.confidence != null
                    ? m.confidence.toFixed(2)
                    : "—"}
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={5} className="af-empty-row">
                  No suggested mappings returned from the backend.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Unmapped columns (if any) */}
      {(unmappedA.length > 0 || unmappedB.length > 0) && (
        <div className="af-unmapped">
          {unmappedA.length > 0 && (
            <div className="af-unmapped-block">
              <div className="af-unmapped-title">Unmapped columns in Dataset A</div>
              <div className="af-unmapped-chips">
                {unmappedA.map((c) => (
                  <span key={c} className="af-unmapped-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {unmappedB.length > 0 && (
            <div className="af-unmapped-block">
              <div className="af-unmapped-title">Unmapped columns in Dataset B</div>
              <div className="af-unmapped-chips">
                {unmappedB.map((c) => (
                  <span key={c} className="af-unmapped-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional: sample snippets for context */}
      {(dfASample || dfBSample) && (
        <div className="af-samples">
          {dfASample && (
            <div className="af-sample-card">
              <div className="af-sample-header">Dataset A sample</div>
              <pre className="af-sample-code">
                {JSON.stringify(dfASample, null, 2)}
              </pre>
            </div>
          )}
          {dfBSample && (
            <div className="af-sample-card">
              <div className="af-sample-header">Dataset B sample</div>
              <pre className="af-sample-code">
                {JSON.stringify(dfBSample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Error + action */}
      <div className="af-footer">
        {error && <div className="af-error">{error}</div>}

        <button
          type="button"
          className={`af-approve-btn ${
            loading ? "af-approve-btn-disabled" : ""
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <span className="af-spinner" />}
          {loading ? "Running reconciliation..." : "Approve & Run Reconciliation"}
        </button>
      </div>
    </div>
  );
}
