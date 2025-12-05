// frontend/src/components/ReconcileForm.js
import React, { useState } from "react";
import { callRecon } from "../api";
import SourceConfigForm from "./SourceConfigForm";
import "./ReconcileForm.css";

export default function ReconcileForm({ setResult }) {
  const [sourceA, setSourceA] = useState({ type: "" });
  const [sourceB, setSourceB] = useState({ type: "" });

  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);

  const [absThreshold, setAbsThreshold] = useState(0.01);
  const [relThreshold, setRelThreshold] = useState(0.001);

  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = async () => {
    if (!sourceA.type || !sourceB.type) {
      alert("Please select source type for both Dataset A and Dataset B");
      return;
    }

    // Normalize comma-separated fields into arrays where backend expects them
    const normalizeSource = (src) => {
      const copy = { ...src };

      if (copy.columns && typeof copy.columns === "string") {
        copy.columns = copy.columns
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      if (copy.numeric_cols && typeof copy.numeric_cols === "string") {
        copy.numeric_cols = copy.numeric_cols
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      if (copy.array_cols && typeof copy.array_cols === "string") {
        copy.array_cols = copy.array_cols
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }

      return copy;
    };

    const datasetA = normalizeSource(sourceA);
    const datasetB = normalizeSource(sourceB);

    // Thresholds picked from the screen
    const thresholds = {
      abs: Number(absThreshold),
      rel: Number(relThreshold),
    };

    const entities = []; // extend later if needed

    const formData = new FormData();
    formData.append("dataset_a", JSON.stringify(datasetA));
    formData.append("dataset_b", JSON.stringify(datasetB));
    formData.append("thresholds", JSON.stringify(thresholds));
    formData.append("entities", JSON.stringify(entities));

    if (fileA) {
      formData.append("fileA", fileA);
    }
    if (fileB) {
      formData.append("fileB", fileB);
    }

    try {
      setIsRunning(true);
      // IMPORTANT: second arg true => send multipart/form-data
      const res = await callRecon(formData, true);
      setResult(res);
    } catch (err) {
      console.error("Reconciliation error:", err);
      alert(
        "Reconciliation failed. Please check the browser console for details."
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rf-root">
      {/* Dataset cards */}
      <div className="rf-datasets">
        <div className="rf-dataset-card">
          <div className="rf-dataset-header">
            <div className="rf-dataset-badge rf-dataset-badge-a">A</div>
            <div>
              <div className="rf-dataset-title">Dataset A</div>
              <div className="rf-dataset-subtitle">
                Reference / left-hand dataset
              </div>
            </div>
          </div>

          <SourceConfigForm
            label="Dataset A"
            value={sourceA}
            onChange={setSourceA}
            onFileChange={setFileA}
          />
        </div>

        <div className="rf-dataset-card">
          <div className="rf-dataset-header">
            <div className="rf-dataset-badge rf-dataset-badge-b">B</div>
            <div>
              <div className="rf-dataset-title">Dataset B</div>
              <div className="rf-dataset-subtitle">
                Comparison / right-hand dataset
              </div>
            </div>
          </div>

          <SourceConfigForm
            label="Dataset B"
            value={sourceB}
            onChange={setSourceB}
            onFileChange={setFileB}
          />
        </div>
      </div>

      {/* Threshold section */}
      <div className="rf-threshold-panel">
        <div className="rf-threshold-header">
          <div>
            <div className="rf-threshold-title">Numeric thresholds</div>
            <div className="rf-threshold-subtitle">
              Control how strict the comparison is for numeric columns.
            </div>
          </div>
        </div>

        <div className="rf-threshold-grid">
          <div className="rf-field">
            <label className="rf-label">Absolute difference threshold</label>
            <input
              type="number"
              step="0.0001"
              value={absThreshold}
              onChange={(e) => setAbsThreshold(e.target.value)}
              className="rf-input"
            />
            <div className="rf-helper">
              Maximum absolute difference allowed (e.g. 0.01 = ±0.01).
            </div>
          </div>

          <div className="rf-field">
            <label className="rf-label">Relative difference threshold</label>
            <input
              type="number"
              step="0.0001"
              value={relThreshold}
              onChange={(e) => setRelThreshold(e.target.value)}
              className="rf-input"
            />
            <div className="rf-helper">
              Maximum relative difference allowed (e.g. 0.001 = 0.1%).
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rf-actions">
        <div className="rf-actions-text">
          After you run reconciliation, preview, approval, and final results
          will appear in the right-hand panel.
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isRunning}
          className={`rf-run-btn ${isRunning ? "rf-run-btn-disabled" : ""}`}
        >
          {isRunning && <span className="rf-spinner" />}
          {isRunning ? "Running reconciliation..." : "Run reconciliation"}
        </button>
      </div>
    </div>
  );
}
