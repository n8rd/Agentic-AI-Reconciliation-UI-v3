import React, { useState } from "react";
import { callRecon } from "../api";
import SourceConfigForm from "./SourceConfigForm";

export default function ReconcileForm({ setResult }) {
  const [sourceA, setSourceA] = useState({ type: "" });
  const [sourceB, setSourceB] = useState({ type: "" });

  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);

  const [absThreshold, setAbsThreshold] = useState(0.01);
  const [relThreshold, setRelThreshold] = useState(0.001);

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

    const thresholds = {
      abs: Number(absThreshold),
      rel: Number(relThreshold),
    };

    const entities = []; // same as before; extend later if needed

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
      const res = await callRecon(formData);
      setResult(res);
    } catch (err) {
      console.error("Reconciliation error:", err);
      alert("Reconciliation failed. Check console for details.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <SourceConfigForm
        label="Dataset A"
        value={sourceA}
        onChange={setSourceA}
        onFileChange={setFileA}
      />
      <SourceConfigForm
        label="Dataset B"
        value={sourceB}
        onChange={setSourceB}
        onFileChange={setFileB}
      />

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div>
          <label>Absolute difference threshold</label>
          <input
            type="number"
            step="0.0001"
            value={absThreshold}
            onChange={(e) => setAbsThreshold(e.target.value)}
          />
        </div>
        <div>
          <label>Relative difference threshold</label>
          <input
            type="number"
            step="0.0001"
            value={relThreshold}
            onChange={(e) => setRelThreshold(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleSubmit}>Run Reconciliation</button>
    </div>
  );
}
