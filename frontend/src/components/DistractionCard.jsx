import React from "react";

export function DistractionCard({ data }) {
  const isDistracted = data?.is_distracted;
  const isUncertain = data?.status === "UNCERTAIN";

  let badgeTxt = "WAITING";
  let badgeCls = "badge-safe";
  if (data) {
    if (isDistracted) {
      badgeTxt = "DISTRACTED";
      badgeCls = "badge-warn";
    } else if (isUncertain) {
      badgeTxt = "UNCERTAIN";
      badgeCls = "badge-muted";
    } else {
      badgeTxt = "NOT DISTRACTED";
      badgeCls = "badge-safe";
    }
  }

  const conf = data ? Math.min(100, Math.max(0, Number(data.confidence || 0))) : 0;
  const top3 = data?.top_classes || [];
  const dur = Number(data?.distracted_elapsed_seconds || 0).toFixed(1);
  const frames = data?.distracted_frame_count ?? 0;

  return (
    <div
      className={`panel detection-panel ${isDistracted ? "state-warn" : isUncertain ? "" : "state-safe"}`}
      id="distractionPanel"
      aria-label="Distraction Detection"
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
            <circle cx="12" cy="12" r="10" />
            <path d="m4.93 4.93 4.24 4.24" />
            <path d="m14.83 9.17 4.24-4.24" />
            <path d="M12 12v9" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h2>DISTRACTION</h2>
        </div>
        <div className={`detection-badge ${badgeCls}`} id="distractionBadge">
          {badgeTxt}
        </div>
      </div>

      <div className="detection-body">
        {/* Current State Banner */}
        <div className="det-main">
          <div
            className={`det-icon ${isDistracted ? "warn" : isUncertain ? "" : "safe"}`}
            id="distractionIcon"
            aria-hidden="true"
          >
            {isDistracted ? "!" : "✓"}
          </div>
          <div className="det-info">
            <span
              className="det-label"
              id="distractionLabel"
              style={{ color: isDistracted ? "var(--orange-primary)" : "var(--navy-dark)" }}
            >
              {data ? data.prediction || "Waiting for stream…" : "Waiting for stream…"}
            </span>
            <span className="det-raw" id="distractionRaw">
              Raw: {data?.raw_prediction || "—"}
            </span>
          </div>
          <div className="det-conf-col">
            <span className="det-conf-sub">CONFIDENCE</span>
            <strong className="det-conf-val" id="distractionConf">
              {conf.toFixed(1)}%
            </strong>
          </div>
        </div>

        {/* Top 3 Predictions Clean List */}
        <div className="top3-container">
          <span className="top3-title">TOP PREDICTIONS</span>
          <div className="top3-list" id="top3List">
            {[0, 1, 2].map((idx) => {
              const item = top3[idx];
              const isTop = idx === 0;
              return (
                <div
                  key={idx}
                  className={`top3-item ${isTop ? "is-top" : ""}`}
                  id={`top3_${idx}`}
                >
                  <span className="top3-rank">{idx + 1}</span>
                  <span className="top3-name">
                    {item ? item.class_name : idx === 0 ? "Safe Driving" : "—"}
                  </span>
                  <strong className="top3-conf">
                    {item ? `${Number(item.confidence || 0).toFixed(1)}%` : "—"}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distraction Metrics Row */}
        <div className="timer-row">
          <div className="timer-cell">
            <span className="timer-label">Duration</span>
            <strong id="distractDuration">{dur}s</strong>
          </div>
          <div className="timer-cell">
            <span className="timer-label">Frames</span>
            <strong id="distractFrames">{frames}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
