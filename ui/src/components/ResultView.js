// frontend/src/components/ResultView.js
import React, { useState } from "react";
import "./ResultView.css";

export default function ResultView({ result }) {
  const [showRaw, setShowRaw] = useState(false);

  // Nothing run yet
  if (!result) {
    return (
      <div className="rv-card rv-empty-card">
        <div className="rv-empty-icon">👀</div>
        <h2 className="rv-title">No reconciliation run yet</h2>
        <p className="rv-text">
          Configure Dataset A and Dataset B on the left, then click{" "}
          <strong>Run Reconciliation</strong> to see metrics, SQL, and sample
          mismatches here.
        </p>
      </div>
    );
  }

  // Waiting for approval state
  if (result.status === "PENDING_APPROVAL") {
    return (
      <div className="rv-card">
        <div className="rv-header">
          <h2 className="rv-title">
            Step 2 · Preview (Waiting for Your Approval)
          </h2>
          <span className="rv-pill rv-pill-warning">Pending approval</span>
        </div>
        <p className="rv-text">
          Sample rows and suggested column mappings should be visible in the
          approval panel on the left. Review them, adjust mappings if needed,
          and click{" "}
          <strong>Approve &amp; Run Reconciliation</strong> to execute the full
          reconciliation.
        </p>
      </div>
    );
  }

  // Final / completed or any other status
  const summary = result.summary || result.metrics || null;
  const previewRows =
    Array.isArray(result.preview_rows) && result.preview_rows.length > 0
      ? result.preview_rows
      : null;

  return (
    <div className="rv-card rv-main-card">
      <div className="rv-header">
        <h2 className="rv-title">Reconciliation Result</h2>
        {result.status && (
          <span className="rv-pill rv-pill-success">
            {String(result.status).toUpperCase()}
          </span>
        )}
      </div>
      <p className="rv-subtitle">
        High-level metrics, generated SQL, sample mismatches, and raw payload.
      </p>

      {/* Summary metrics, if present */}
      {summary && (
        <div className="rv-metrics-grid">
          {summary.total_rows != null && (
            <MetricCard
              label="Total rows compared"
              value={summary.total_rows}
              helper="After join / entity resolution"
            />
          )}
          {summary.mismatched_rows != null && (
            <MetricCard
              label="Mismatched rows"
              value={summary.mismatched_rows}
              helper="Rows with differences beyond thresholds"
            />
          )}
          {summary.match_rate != null && (
            <MetricCard
              label="Match rate"
              value={(summary.match_rate * 100).toFixed(1) + "%"}
              helper="Within configured thresholds"
            />
          )}
        </div>
      )}

      {/* Generated SQL, if present */}
      {result.sql && (
        <div className="rv-section">
          <div className="rv-section-header">
            <h3 className="rv-section-title">Generated reconciliation SQL</h3>
            <button
              type="button"
              className="rv-copy-button"
              onClick={() => {
                if (navigator && navigator.clipboard) {
                  navigator.clipboard
                    .writeText(result.sql)
                    .catch((e) => console.error("Clipboard error:", e));
                }
              }}
            >
              Copy SQL
            </button>
          </div>
          <pre className="rv-code-block">
            <code>{result.sql}</code>
          </pre>
        </div>
      )}

      {/* Sample mismatches preview, if present */}
      {previewRows && (
        <div className="rv-section">
          <h3 className="rv-section-title">Sample mismatches</h3>
          <div className="rv-table-wrapper">
            <table className="rv-table">
              <thead>
                <tr>
                  {Object.keys(previewRows[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(previewRows[0]).map((col) => (
                      <td key={col}>{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw JSON toggle – always available */}
      <div className="rv-section rv-raw-section">
        <button
          type="button"
          className="rv-raw-toggle"
          onClick={() => setShowRaw((prev) => !prev)}
        >
          {showRaw ? "Hide raw response" : "Show raw response (debug)"}
        </button>

        {showRaw && (
          <pre className="rv-code-block rv-raw-block">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }) {
  return (
    <div className="rv-metric-card">
      <div className="rv-metric-label">{label}</div>
      <div className="rv-metric-value">{value}</div>
      {helper && <div className="rv-metric-helper">{helper}</div>}
    </div>
  );
}
