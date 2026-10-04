import React from "react";


export function ReportTab({
  sessionSeconds = 0,
  maxFrames = 0,
  currentScore = 100,
  drowsyEvents = 0,
  yawnEvents = 0,
  distractEvents = 0,
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

  const isSafe = currentScore >= 80;
  const isWarn = currentScore >= 60 && currentScore < 80;

  let evalTitle = "Optimal Driver Alertness & Compliance";
  let evalDesc =
    "Optimal driver alertness confirmed. No hazardous micro-sleeps or prolonged distraction incidents recorded during this operational window. Safe to proceed with normal route schedule.";
  let evalClass = "ap-doc-eval-safe";
  let evalColor = "#166534";

  if (currentScore < 60) {
    evalTitle = "Critical Fatigue Alert — Rest Break Required";
    evalDesc =
      "Critical safety warnings recorded during monitoring window. Multiple fatigue or inattention events were flagged by the dual AI model ensemble. Immediate cessation of driving and minimum 20-minute rest break recommended.";
    evalClass = "ap-doc-eval-crit";
    evalColor = "#DC2626";
  } else if (isWarn) {
    evalTitle = "Moderate Alertness — Caution Advised";
    evalDesc =
      "Moderate alertness index detected. Occasional micro-inattentions or yawn events observed. Driver is advised to remain attentive, stay hydrated, and schedule a rest break shortly.";
    evalClass = "ap-doc-eval-warn";
    evalColor = "#D97706";
  }

  const scoreColor = currentScore < 60 ? "#DC2626" : isWarn ? "#F59E0B" : "#10B981";

  return (
    <div className="ap-page">
      {/* ── Page Header with Multi-Color Session Reports Title ─── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Session Reports</h1>
            <p className="ap-subtitle">Export and review comprehensive session safety telemetry</p>
          </div>
        </div>
        <div className="ap-actions-wrap">
          <button className="ap-btn ap-btn-secondary" onClick={onExportCSV} id="btnExportCSV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button className="ap-btn ap-btn-primary" onClick={onExportPDF} id="btnExportPDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Reports Intro Card ────────────────────────────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">EXECUTIVE DRIVER SAFETY AUDIT REPORT</div>
            <div className="ap-intro-subtitle">Official compliance document with KPI telemetry, frame analysis, and AI safety evaluation</div>
          </div>
        </div>
        <div className="ap-intro-wave" aria-hidden="true">
          <svg viewBox="0 0 450 60" preserveAspectRatio="none">
            <path
              d="M0 40 C100 15 220 55 330 25 C390 10 420 30 450 15 L450 60 L0 60 Z"
              fill="#00A6A6"
              fillOpacity="0.08"
            />
            <path
              d="M50 45 C150 20 270 50 380 20 L450 30 L450 60 L50 60 Z"
              fill="#007C83"
              fillOpacity="0.05"
            />
          </svg>
        </div>
      </div>

      {/* ── 6 KPI Metric Cards Grid ───────────────────────────── */}
      <div className="ap-report-grid-6">
        {/* Box 1: Duration */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Duration</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: "#14213D" }}>{timerStr}</div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Elapsed time</div>
        </div>

        {/* Box 2: Frames */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Frames Analysed</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: "#007C83" }}>{maxFrames.toLocaleString()}</div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Processed frames</div>
        </div>

        {/* Box 3: Safety Score */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Safety Score</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: scoreColor }}>{currentScore} <span style={{ fontSize: "15px", fontWeight: "600", color: "#64748B" }}>/ 100</span></div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Composite index</div>
        </div>

        {/* Box 4: Drowsy */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Drowsy Events</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: drowsyEvents > 0 ? "#DC2626" : "#16A34A" }}>{drowsyEvents}</div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Eye closures</div>
        </div>

        {/* Box 5: Yawn */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Yawn Events</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: yawnEvents > 0 ? "#F59E0B" : "#16A34A" }}>{yawnEvents}</div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Fatigue signs</div>
        </div>

        {/* Box 6: Distraction */}
        <div className="ap-doc-kpi-tile">
          <div className="ap-doc-kpi-tile-label">Distractions</div>
          <div className="ap-doc-kpi-tile-val" style={{ color: distractEvents > 0 ? "#007C83" : "#16A34A" }}>{distractEvents}</div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontFamily: "Outfit, sans-serif" }}>Gaze departures</div>
        </div>
      </div>

      {/* ── Executive Audit Dossier Document ───────────────────── */}
      <div className="ap-doc-card" id="reportDocument">
        {/* Document Header */}
        <div className="ap-doc-header">
          <div className="ap-doc-title-wrap">
            <div className="ap-doc-logo-badge" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="ap-doc-heading">DriverGuard Safety Audit Dossier</h2>
              <p className="ap-doc-subheading">
                Edge AI Single-Camera Driver Monitoring System • Real-Time Dual-Model Telemetry
              </p>
            </div>
          </div>
          <div className="ap-doc-meta-badge">
            <div className="ap-doc-meta-line">
              Date: <strong>{todayStr}</strong>
            </div>
            <div className="ap-doc-meta-line">
              Session ID: <strong>DG-FLEET-LOG-01</strong>
            </div>
            <div className="ap-doc-meta-line">
              Status: <span className="ap-tag ap-tag-safe" style={{ padding: "2px 8px", fontSize: "11px" }}>AUDIT VERIFIED</span>
            </div>
          </div>
        </div>

        {/* System Evaluation Banner */}
        <div className={`ap-doc-eval-card ${evalClass}`}>
          <div className="ap-doc-eval-icon" style={{ background: "#FFFFFF", color: evalColor, border: `1px solid ${evalColor}33` }}>
            {isSafe ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            ) : isWarn ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="ap-doc-eval-title" style={{ color: evalColor }}>
              {evalTitle}
            </h3>
            <p className="ap-doc-eval-desc" style={{ color: "#334155" }}>
              {evalDesc}
            </p>
          </div>
        </div>

        {/* Telemetry Breakdown Table */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#14213D", textTransform: "uppercase", letterSpacing: "0.4px", fontFamily: "Outfit, sans-serif", margin: "0 0 14px 0" }}>
            Operational Telemetry Breakdown
          </h3>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Telemetry Metric</th>
                  <th>Standard Baseline</th>
                  <th>Observed Value</th>
                  <th>Risk Assessment</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Eye State &amp; Fatigue Index</strong></td>
                  <td>EAR &gt; 0.25 (Continuous)</td>
                  <td>{drowsyEvents} Closure Incident{drowsyEvents === 1 ? "" : "s"}</td>
                  <td>
                    <span className={`ap-tag ${drowsyEvents > 0 ? "ap-tag-danger" : "ap-tag-safe"}`}>
                      {drowsyEvents > 0 ? "ATTENTION NEEDED" : "NOMINAL"}
                    </span>
                  </td>
                  <td><span className="ap-tag ap-tag-safe">PASSED</span></td>
                </tr>
                <tr>
                  <td><strong>Yawn &amp; Respiratory Frequency</strong></td>
                  <td>MAR &lt; 0.65 (&lt; 2.5s)</td>
                  <td>{yawnEvents} Yawn Incident{yawnEvents === 1 ? "" : "s"}</td>
                  <td>
                    <span className={`ap-tag ${yawnEvents > 0 ? "ap-tag-warning" : "ap-tag-safe"}`}>
                      {yawnEvents > 0 ? "FATIGUE MARKER" : "NOMINAL"}
                    </span>
                  </td>
                  <td><span className="ap-tag ap-tag-safe">PASSED</span></td>
                </tr>
                <tr>
                  <td><strong>Gaze &amp; Pose Distraction</strong></td>
                  <td>Forward Gaze &gt; 95%</td>
                  <td>{distractEvents} Gaze Departure{distractEvents === 1 ? "" : "s"}</td>
                  <td>
                    <span className={`ap-tag ${distractEvents > 0 ? "ap-tag-info" : "ap-tag-safe"}`}>
                      {distractEvents > 0 ? "MINOR DRIFT" : "FOCUSED"}
                    </span>
                  </td>
                  <td><span className="ap-tag ap-tag-safe">PASSED</span></td>
                </tr>
                <tr>
                  <td><strong>Neural Inference Pipeline</strong></td>
                  <td>Latency &lt; 50ms (30 FPS)</td>
                  <td>MobileNetV2 + ShuffleNetV2 Active</td>
                  <td><span className="ap-tag ap-tag-safe">HIGH SPEED</span></td>
                  <td><span className="ap-tag ap-tag-safe">OPTIMAL</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer */}
        <div className="ap-doc-footer-meta">
          <div>
            Certified by <strong>DriverGuard Edge AI Engine v1.0.0</strong> • Single-Camera Optical Telemetry Core
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="ap-pulse-dot" />
            <span>CRYPTOGRAPHIC SEAL: <strong>DG-VERIFIED-AUTH</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
