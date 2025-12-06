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

  // ---------- Final / completed or any other status ----------
  const summary = result.summary || result.metrics || null;

  // Rows returned by the backend query (full reconciliation results)
  const allRows = Array.isArray(result.result) ? result.result : [];

  // Preview rows: use explicit preview_rows if present, else first N rows
  const previewRows =
    Array.isArray(result.preview_rows) && result.preview_rows.length > 0
      ? result.preview_rows
      : allRows.length > 0
      ? allRows.slice(0, 20)
      : null;

  const mappings = result.schema_mapping?.matches || [];
  const thresholds = result.thresholds || {};
  const absThr = thresholds.abs ?? 0;
  const relThr = thresholds.rel ?? 0;

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
        High-level metrics, column-wise comparison between Dataset A and B,
        generated SQL, sample mismatches, and the full raw payload (debug).
      </p>

      {/* Explanation, if present */}
      {result.explanation && (
        <div className="rv-section">
          <h3 className="rv-section-title">Explanation</h3>
          <p className="rv-text" style={{ whiteSpace: "pre-wrap" }}>
            {result.explanation}
          </p>
        </div>
      )}

      {/* High-level metrics, if present */}
      {summary && (
        <div className="rv-section">
          <h3 className="rv-section-title">High-level metrics</h3>
          <div className="rv-metrics-grid">
            {summary.total_rows != null && (
              <MetricCard
                label="Total result rows"
                value={summary.total_rows}
                helper="Rows returned by reconciliation query"
              />
            )}
            {summary.mismatched_rows != null && (
              <MetricCard
                label="Rows with differences"
                value={summary.mismatched_rows}
                helper="Rows with at least one difference"
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
        </div>
      )}

      {/* Column-wise reconciliation matrix (full query results) */}
      {allRows.length > 0 && mappings.length > 0 && (
        <div className="rv-section">
          <h3 className="rv-section-title">Column-wise reconciliation matrix</h3>
          <p className="rv-text">
            For every mapped column, each row shows:{" "}
            <code>value in A</code>, <code>value in B</code>,{" "}
            <code>Status</code>, and <code>Explanation</code>, using the
            approved schema mapping and configured thresholds.
          </p>
          <div className="rv-table-wrapper">
            <table className="rv-table">
              <thead>
                <tr>
                  {mappings.map((m) => (
                    <React.Fragment key={m.a_col}>
                      <th>{m.a_col} (A)</th>
                      <th>{m.b_col} (B)</th>
                      <th>Status</th>
                      <th>Explanation</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {mappings.map((m) => {
                      const aVal = row[m.a_col];
                      const bVal = row[m.b_col];
                      let status = "MATCH";
                      let explanation = "";

                      if (m.type === "string") {
                        const flagKey = `${m.a_col}_string_recon`;
                        const flag = row[flagKey];

                        if (flag) {
                          status = flag;
                        } else if (aVal == null && bVal == null) {
                          status = "MATCH";
                        } else if (aVal == null || bVal == null) {
                          status = "MISMATCH";
                        } else {
                          status =
                            String(aVal).toLowerCase() ===
                            String(bVal).toLowerCase()
                              ? "MATCH"
                              : "MISMATCH";
                        }

                        explanation =
                          status === "MATCH"
                            ? "Values match (case-insensitive)."
                            : `Values differ: A='${aVal ?? ""}', B='${
                                bVal ?? ""
                              }'.`;
                      } else if (m.type === "numeric") {
                        const absKey = `${m.a_col}_abs_diff`;
                        const relKey = `${m.a_col}_rel_diff`;
                        const abs = row[absKey];
                        const rel = row[relKey];

                        const absOK =
                          abs == null ||
                          Number.isNaN(abs) ||
                          Math.abs(Number(abs)) <= absThr;
                        const relOK =
                          rel == null ||
                          Number.isNaN(rel) ||
                          Math.abs(Number(rel)) <= relThr;

                        status = absOK && relOK ? "MATCH" : "MISMATCH";

                        if (status === "MATCH") {
                          explanation = `Within thresholds (abs=${
                            abs ?? "NA"
                          }, rel=${rel ?? "NA"}).`;
                        } else {
                          explanation = `Threshold breach: abs=${
                            abs ?? "NA"
                          }, rel=${rel ?? "NA"} (limits: abs>${absThr}, rel>${relThr}).`;
                        }
                      } else {
                        // Fallback for unknown type
                        status = aVal === bVal ? "MATCH" : "MISMATCH";
                        explanation = `Raw comparison only: A='${aVal ?? ""}', B='${
                          bVal ?? ""
                        }'.`;
                      }

                      return (
                        <React.Fragment key={`${rowIndex}-${m.a_col}`}>
                          <td>{aVal != null ? String(aVal) : ""}</td>
                          <td>{bVal != null ? String(bVal) : ""}</td>
                          <td
                            className={
                              status === "MATCH" ? "cell-ok" : "cell-bad"
                            }
                          >
                            {status}
                          </td>
                          <td>{explanation}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated SQL, if present */}
      {result.sql && (
        <div className="rv-section">
          <div className="rv-section-header">
            <h3 className="rv-section-title" >Generated reconciliation SQL</h3>
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
          <p className="rv-text rv-section-subtitle">
            These are up to the first 20 rows returned by the reconciliation
            query, or the preview provided by the backend.
          </p>
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
                      <td key={col}>
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw JSON debug toggle */}
      <div className="rv-section rv-raw-section">
        <button
          type="button"
          className="rv-raw-toggle"
          onClick={() => setShowRaw((prev) => !prev)}
        >
          {showRaw
            ? "Hide raw response (debug)"
            : "Show raw response (debug JSON)"}
        </button>
        {showRaw && (
          <pre className="rv-raw-block">
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
