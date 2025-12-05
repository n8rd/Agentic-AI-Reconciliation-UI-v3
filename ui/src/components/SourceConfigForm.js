// frontend/src/components/SourceConfigForm.js
import React from "react";
import "./SourceConfigForm.css";

const SOURCE_TYPES = [
  { value: "file", label: "File (CSV/JSON/Parquet/Avro/Excel)" },
  { value: "bigquery", label: "BigQuery Table" },
  { value: "oracle", label: "Oracle" },
  { value: "postgres", label: "Postgres" },
  { value: "hive", label: "Hive" },
];

export default function SourceConfigForm({ label, value, onChange, onFileChange }) {
  const source = value || {};

  const handleFieldChange = (field, fieldValue) => {
    onChange({ ...source, [field]: fieldValue });
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    // Reset to sane defaults for the chosen type (matches backend expectations)
    let base = { type };

    if (type === "file") {
      base = { type: "file", path: "", format: "" };
    } else if (type === "bigquery") {
      base = {
        type: "bigquery",
        table: "",
        table_fqn: "",
        numeric_cols: "",
        array_cols: "",
      };
    } else if (type === "oracle") {
      base = {
        type: "oracle",
        host: "",
        port: 1521,
        service: "",
        user: "",
        password: "",
        table: "",
        columns: "",
      };
    } else if (type === "postgres") {
      base = {
        type: "postgres",
        host: "",
        port: 5432,
        database: "",
        user: "",
        password: "",
        table: "",
        columns: "",
      };
    } else if (type === "hive") {
      base = {
        type: "hive",
        host: "",
        port: 10000,
        database: "default",
        user: "",
        table: "",
        columns: "",
      };
    }

    onChange(base);

    // Clear selected file when type changes
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const renderFieldsForType = () => {
    const t = source.type;
    if (!t) return null;

    if (t === "file") {
      return (
        <div className="scf-block scf-block-file">
          <div className="scf-field">
            <label className="scf-label">{label} sample file</label>
            <input
              type="file"
              className="scf-input scf-file"
              accept=".csv,.json,.parquet,.avro,.xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (onFileChange) onFileChange(f || null);
              }}
            />
            <div className="scf-helper">
              Upload a small representative sample; backend will create a temp
              table and infer schema.
            </div>
          </div>

          <div className="scf-field">
            <label className="scf-label">File path (optional)</label>
            <input
              type="text"
              className="scf-input"
              placeholder="e.g. gs://bucket/trades_a.parquet or /data/trades.csv"
              value={source.path || ""}
              onChange={(e) => handleFieldChange("path", e.target.value)}
            />
            <div className="scf-helper">
              Optional: GCS / HDFS / local path if you want backend to fetch
              directly.
            </div>
          </div>

          <div className="scf-field">
            <label className="scf-label">Format (optional)</label>
            <input
              type="text"
              className="scf-input"
              placeholder="csv, json, parquet, avro, excel"
              value={source.format || ""}
              onChange={(e) => handleFieldChange("format", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (t === "bigquery") {
      return (
        <div className="scf-block">
          <div className="scf-block-header">BigQuery configuration</div>

          <div className="scf-field">
            <label className="scf-label">Table (FQN)</label>
            <input
              type="text"
              className="scf-input"
              placeholder="project.dataset.table"
              value={source.table || ""}
              onChange={(e) => {
                const val = e.target.value;
                handleFieldChange("table", val);
                handleFieldChange("table_fqn", val);
              }}
            />
            <div className="scf-helper">
              Fully-qualified BigQuery table name.
            </div>
          </div>

          <div className="scf-field">
            <label className="scf-label">Numeric columns (comma-separated)</label>
            <input
              type="text"
              className="scf-input"
              placeholder="amount, notional, pnl"
              value={source.numeric_cols || ""}
              onChange={(e) => handleFieldChange("numeric_cols", e.target.value)}
            />
          </div>

          <div className="scf-field">
            <label className="scf-label">Array columns (comma-separated)</label>
            <input
              type="text"
              className="scf-input"
              placeholder="tags, labels"
              value={source.array_cols || ""}
              onChange={(e) => handleFieldChange("array_cols", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (t === "oracle" || t === "postgres" || t === "hive") {
      return (
        <div className="scf-block">
          <div className="scf-block-header">
            {t === "oracle"
              ? "Oracle configuration"
              : t === "postgres"
              ? "Postgres configuration"
              : "Hive configuration"}
          </div>

          <div className="scf-field scf-grid-2">
            <div>
              <label className="scf-label">Host</label>
              <input
                type="text"
                className="scf-input"
                placeholder="db.host.internal"
                value={source.host || ""}
                onChange={(e) => handleFieldChange("host", e.target.value)}
              />
            </div>

            <div>
              <label className="scf-label">Port</label>
              <input
                type="number"
                className="scf-input"
                value={source.port || ""}
                onChange={(e) =>
                  handleFieldChange("port", Number(e.target.value || 0))
                }
              />
            </div>
          </div>

          {t === "postgres" && (
            <div className="scf-field">
              <label className="scf-label">Database</label>
              <input
                type="text"
                className="scf-input"
                value={source.database || ""}
                onChange={(e) =>
                  handleFieldChange("database", e.target.value)
                }
              />
            </div>
          )}

          {t === "oracle" && (
            <div className="scf-field">
              <label className="scf-label">Service name</label>
              <input
                type="text"
                className="scf-input"
                value={source.service || ""}
                onChange={(e) => handleFieldChange("service", e.target.value)}
              />
            </div>
          )}

          {t === "hive" && (
            <div className="scf-field">
              <label className="scf-label">Database</label>
              <input
                type="text"
                className="scf-input"
                value={source.database || ""}
                onChange={(e) =>
                  handleFieldChange("database", e.target.value)
                }
              />
            </div>
          )}

          <div className="scf-field scf-grid-2">
            <div>
              <label className="scf-label">User</label>
              <input
                type="text"
                className="scf-input"
                value={source.user || ""}
                onChange={(e) => handleFieldChange("user", e.target.value)}
              />
            </div>
            <div>
              <label className="scf-label">Password</label>
              <input
                type="password"
                className="scf-input"
                value={source.password || ""}
                onChange={(e) =>
                  handleFieldChange("password", e.target.value)
                }
              />
            </div>
          </div>

          <div className="scf-field">
            <label className="scf-label">Table</label>
            <input
              type="text"
              className="scf-input"
              placeholder="TRADES or schema.TRADES"
              value={source.table || ""}
              onChange={(e) => handleFieldChange("table", e.target.value)}
            />
          </div>

          <div className="scf-field">
            <label className="scf-label">
              Columns (optional, comma-separated)
            </label>
            <input
              type="text"
              className="scf-input"
              placeholder="trade_id, amount, trade_date"
              value={source.columns || ""}
              onChange={(e) => handleFieldChange("columns", e.target.value)}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="scf-root">
      <div className="scf-header-row">
        <h4 className="scf-title">{label}</h4>
      </div>

      <div className="scf-field">
        <label className="scf-label">Source type</label>
        <select
          className="scf-input scf-select"
          value={source.type || ""}
          onChange={handleTypeChange}
        >
          <option value="">Select source type</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {renderFieldsForType()}
    </div>
  );
}
