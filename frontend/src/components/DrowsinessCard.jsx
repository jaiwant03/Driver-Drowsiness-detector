import React from "react";

function formatLabel(raw) {
  const map = {
    Closed: "Eyes Closed",
    Open: "Eyes Open",
    no_yawn: "No Yawn",
    yawn: "Yawn",
    "No Face": "No Face",
    Uncertain: "Uncertain",
    Waiting: "Waiting for stream…",
  };
  return map[raw] ?? raw ?? "Waiting for stream…";
}

export function DrowsinessCard({ data }) {
  const isDrowsy = data?.is_drowsy;
  const noFace = data ? !data.face_detected : false;
  const isUncertain = data?.status === "LOW CONFIDENCE" || data?.status === "UNCERTAIN";

  let badgeTxt = "WAITING";
  let badgeCls = "badge-safe";
  if (data) {
    if (isDrowsy) {
      badgeTxt = "DROWSY";
      badgeCls = "badge-danger";
    } else if (noFace) {
      badgeTxt = "NO FACE";
      badgeCls = "badge-muted";
    } else if (isUncertain) {
      badgeTxt = "UNCERTAIN";
      badgeCls = "badge-muted";
    } else {
      badgeTxt = "ALERT";
      badgeCls = "badge-safe";
    }
  }

  const conf = data ? Math.min(100, Math.max(0, Number(data.confidence || 0))) : 0;
  const probs = data?.probabilities || {};
  const pOpen = Math.min(100, Math.max(0, Number(probs["Open"] || 0) * 100));
  const pClosed = Math.min(100, Math.max(0, Number(probs["Closed"] || 0) * 100));
  const pNoYawn = Math.min(100, Math.max(0, Number(probs["no_yawn"] || 0) * 100));
  const pYawn = Math.min(100, Math.max(0, Number(probs["yawn"] || 0) * 100));

  const dur = Number(data?.drowsy_elapsed_seconds || 0).toFixed(1);
  const frames = data?.drowsy_frame_count ?? 0;
  const faceText = data ? (data.face_detected ? "YES" : "NO") : "—";

  return (
    <div
      className={`panel detection-panel ${isDrowsy ? "state-drowsy" : noFace ? "" : "state-safe"}`}
      id="drowsinessPanel"
      aria-label="Drowsiness Detection"
    >
      <div className="panel-header">
        <div className="panel-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F97316"
            strokeWidth="2.2"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h2>DROWSINESS</h2>
        </div>
        <div className={`detection-badge ${badgeCls}`} id="drowsinessBadge">
          {badgeTxt}
        </div>
      </div>

      <div className="detection-body">
        {/* Current State Banner */}
        <div className="det-main">
          <div
            className={`det-icon ${isDrowsy ? "drowsy" : noFace ? "" : "safe"}`}
            id="drowsinessIcon"
            aria-hidden="true"
          >
            {isDrowsy ? "!" : noFace ? "?" : "✓"}
          </div>
          <div className="det-info">
            <span
              className="det-label"
              id="drowsinessLabel"
              style={{ color: isDrowsy ? "var(--danger-red)" : "var(--navy-dark)" }}
            >
              {data ? formatLabel(data.prediction) : "Waiting for stream…"}
            </span>
            <span className="det-raw" id="drowsinessRaw">
              Raw: {data ? formatLabel(data.raw_prediction) : "—"}
            </span>
          </div>
          <div className="det-conf-col">
            <span className="det-conf-sub">CONFIDENCE</span>
            <strong className="det-conf-val" id="drowsinessConf">
              {conf.toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* Horizontal Class Probability Bars */}
        <div className="prob-grid">
          <div className="prob-item">
            <div className="prob-row">
              <span>Eyes Open</span>
              <strong id="pOpen">{pOpen.toFixed(1)}%</strong>
            </div>
            <div className="prog-track">
              <div
                className="prog-fill alert-fill"
                id="bOpen"
                style={{ width: `${pOpen}%` }}
              ></div>
            </div>
          </div>
          <div className="prob-item">
            <div className="prob-row">
              <span>Eyes Closed</span>
              <strong id="pClosed">{pClosed.toFixed(1)}%</strong>
            </div>
            <div className="prog-track">
              <div
                className="prog-fill drowsy-fill"
                id="bClosed"
                style={{ width: `${pClosed}%` }}
              ></div>
            </div>
          </div>
          <div className="prob-item">
            <div className="prob-row">
              <span>No Yawn</span>
              <strong id="pNoYawn">{pNoYawn.toFixed(1)}%</strong>
            </div>
            <div className="prog-track">
              <div
                className="prog-fill alert-fill"
                id="bNoYawn"
                style={{ width: `${pNoYawn}%` }}
              ></div>
            </div>
          </div>
          <div className="prob-item">
            <div className="prob-row">
              <span>Yawn</span>
              <strong id="pYawn">{pYawn.toFixed(1)}%</strong>
            </div>
            <div className="prog-track">
              <div
                className="prog-fill warn-fill"
                id="bYawn"
                style={{ width: `${pYawn}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Drowsiness Timers Row */}
        <div className="timer-row">
          <div className="timer-cell">
            <span className="timer-label">Duration</span>
            <strong id="drowsyDuration">{dur}s</strong>
          </div>
          <div className="timer-cell">
            <span className="timer-label">Frames</span>
            <strong id="drowsyFrames">{frames}</strong>
          </div>
          <div className="timer-cell">
            <span className="timer-label">Face</span>
            <strong
              id="faceDetected"
              style={{ color: data?.face_detected ? "var(--safe-green)" : "var(--warn-orange)" }}
            >
              {faceText}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
