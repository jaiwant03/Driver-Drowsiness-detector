import React from "react";

export function ReportTab({
  sessionSeconds,
  maxFrames,
  currentScore,
  drowsyEvents,
  yawnEvents,
  distractEvents,
  onExportPDF,
  onExportCSV,
}) {
  const hrs = String(Math.floor(sessionSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(sessionSeconds % 60).padStart(2, "0");
  const timerStr = `${hrs}:${mins}:${secs}`;

  const todayStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let summaryText =
    "Optimal driver alertness. No hazardous fatigue or prolonged distraction incidents recorded during this operational window. Safe to proceed.";
  if (currentScore < 60) {
    summaryText =
      "Critical safety warnings recorded during monitoring window. Multiple fatigue or inattention events occurred. Immediate cessation of driving and rest break recommended.";
  } else if (currentScore < 80) {
    summaryText =
      "Moderate alertness. Occasional micro-inattentions or yawns detected. Driver advised to stay alert and schedule a rest break shortly.";
  }

  return (
    <div className="report-section-wrap">
      <div className="section-title-bar">
        <div className="section-title-left">
          <span className="section-icon-badge">📄</span>
          <div>
            <h2>Executive Fleet Driver Safety Audit Report</h2>
            <p className="section-sub">
              Official safety compliance document with KPI summary, telemetry metrics, and driver evaluation
            </p>
          </div>
        </div>
        <div className="header-badges">
          <button className="btn btn-primary btn-ctrl" onClick={onExportPDF} id="btnExportPDF">
            Download PDF
          </button>
          <button className="btn btn-secondary btn-ctrl" onClick={onExportCSV} id="btnExportCSV">
            Export CSV
          </button>
        </div>
      </div>

      <div className="panel report-page-panel">

          <div className="report-document" id="reportDocument">
            <div className="report-doc-header">
              <div>
                <h1>DriverGuard Safety Audit Report</h1>
                <p>
                  Edge AI Single-Camera Driver Monitoring System • Real-Time Dual-Model Telemetry
                </p>
              </div>
              <div className="report-meta">
                <span>
                  Date: <strong>{todayStr}</strong>
                </span>
                <span>
                  Session ID: <strong>DG-FLEET-LOG-01</strong>
                </span>
              </div>
            </div>

            <div className="report-kpi-grid">
              <div className="report-kpi-box">
                <span>Duration</span>
                <strong>{timerStr}</strong>
              </div>
              <div className="report-kpi-box">
                <span>Frames Analysed</span>
                <strong>{maxFrames.toLocaleString()}</strong>
              </div>
              <div className="report-kpi-box">
                <span>Final Safety Score</span>
                <strong
                  style={{
                    color: currentScore < 50 ? "#DC2626" : currentScore < 75 ? "#F59E0B" : "#16A34A",
                  }}
                >
                  {currentScore} / 100
                </strong>
              </div>
              <div className="report-kpi-box">
                <span>Drowsy Events</span>
                <strong>{drowsyEvents}</strong>
              </div>
              <div className="report-kpi-box">
                <span>Yawn Events</span>
                <strong>{yawnEvents}</strong>
              </div>
              <div className="report-kpi-box">
                <span>Distraction Events</span>
                <strong>{distractEvents}</strong>
              </div>
            </div>

            <div className="report-summary-text">
              <h3>System Evaluation &amp; Recommendation</h3>
              <p>{summaryText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
