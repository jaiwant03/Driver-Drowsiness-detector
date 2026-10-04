import React from "react";

// Subtle corner decorative wave matching the dashboard cards
function CornerWave({ color = "#007C83", opacity = 0.12 }) {
  return (
    <svg
      className="db-card-corner-wave"
      viewBox="0 0 140 70"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 70 C40 40 80 60 140 30 L140 70 Z"
        fill={color}
        fillOpacity={opacity}
      />
      <path
        d="M20 70 C60 50 100 65 140 45 L140 70 Z"
        fill={color}
        fillOpacity={opacity * 0.7}
      />
    </svg>
  );
}

export function AlertsTab({ alertHistory = [], onClear, onOpenGallery, snapshotCount = 0 }) {
  const criticalCount = alertHistory.filter(
    (a) => a.level === "CRITICAL" || a.level === "DROWSY"
  ).length;

  const warningCount = alertHistory.filter(
    (a) => a.level === "WARN" || a.level === "WARNING" || a.level === "DISTRACTED"
  ).length;

  return (
    <div className="ap-page">
      {/* ── Page Header with Multi-Color Alerts Title ──────────── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Alerts</h1>
            <p className="ap-subtitle">Safety alert telemetry &amp; incident history</p>
          </div>
        </div>
        <div className="ap-actions-wrap">
          <span className="ap-telemetry-tag">
            <span className="ap-pulse-dot" />
            LIVE EVENT LOG
          </span>
          {snapshotCount > 0 && (
            <button className="ap-btn ap-btn-secondary" onClick={onOpenGallery}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              View Snapshots ({snapshotCount})
            </button>
          )}
          <button
            className="ap-btn ap-btn-secondary"
            onClick={onClear}
            disabled={alertHistory.length === 0}
            title={alertHistory.length === 0 ? "No alerts to clear" : "Clear all alerts"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear History
          </button>
        </div>
      </div>

      {/* ── Alerts Intro Card ─────────────────────────────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">REAL-TIME ALERT LOG &amp; EVENT TELEMETRY</div>
            <div className="ap-intro-subtitle">Chronological audit history of fatigue warnings, eye closures, and distraction events</div>
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

      {/* ── 4 KPI Cards Grid ─────────────────────────────────── */}
      <div className="ap-kpi-grid">
        {/* Card 1: Total Alerts */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-peacock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span className="ap-kpi-label">TOTAL ALERTS</span>
          </div>
          <div className="ap-kpi-val ap-val-navy">{alertHistory.length}</div>
          <div className="ap-kpi-sub">Events logged in session</div>
          <CornerWave color="#007C83" opacity={0.10} />
        </div>

        {/* Card 2: Critical Severity */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-red" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="ap-kpi-label">CRITICAL EVENTS</span>
          </div>
          <div className="ap-kpi-val ap-val-red">{criticalCount}</div>
          <div className="ap-kpi-sub">High fatigue / sleep alarms</div>
          <CornerWave color="#DC2626" opacity={0.10} />
        </div>

        {/* Card 3: Warning Incidents */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-orange" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="ap-kpi-label">WARNING INCIDENTS</span>
          </div>
          <div className="ap-kpi-val ap-val-orange">{warningCount}</div>
          <div className="ap-kpi-sub">Inattention or yawn alerts</div>
          <CornerWave color="#F59E0B" opacity={0.10} />
        </div>

        {/* Card 4: Safety Snapshots */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-teal" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <span className="ap-kpi-label">SAFETY SNAPSHOTS</span>
          </div>
          <div className="ap-kpi-val ap-val-teal">{snapshotCount}</div>
          <div className="ap-kpi-sub">Evidence images captured</div>
          <CornerWave color="#00A6A6" opacity={0.10} />
        </div>
      </div>

      {/* ── Main Incident Audit Table Card ───────────────────── */}
      <div className="ap-card">
        <div className="ap-card-header">
          <h2 className="ap-card-title">
            <span className="ap-card-title-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <span className="ap-card-title-multicolor">Incident Audit Log</span>
          </h2>
          <span className="ap-card-badge">
            {alertHistory.length} {alertHistory.length === 1 ? "Event" : "Events"} Recorded
          </span>
        </div>

        {alertHistory.length > 0 ? (
          <div className="ap-table-wrap">
            <table className="ap-table" id="fullAlertsTable">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Detection Type &amp; Event Details</th>
                  <th>Driver Safety Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="fullAlertsTbody">
                {alertHistory.map((item) => {
                  const isCrit = item.level === "CRITICAL" || item.level === "DROWSY";
                  const isWarn = item.level === "WARN" || item.level === "WARNING" || item.level === "DISTRACTED";
                  const score = item.score ?? 100;
                  const scoreClass = score < 60 ? "ap-score-low" : score < 80 ? "ap-score-med" : "ap-score-high";

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="ap-timestamp-cell">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {item.time}
                        </span>
                      </td>
                      <td>
                        <span className={`ap-tag ${isCrit ? "ap-tag-danger" : isWarn ? "ap-tag-warning" : "ap-tag-info"}`}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: isCrit ? "#DC2626" : isWarn ? "#D97706" : "#007C83",
                            }}
                          />
                          {item.level}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#14213D", fontSize: "14.5px" }}>{item.desc}</strong>
                      </td>
                      <td>
                        <span className={`ap-score-pill ${scoreClass}`}>
                          {score} / 100
                        </span>
                      </td>
                      <td>
                        <span className="ap-tag ap-tag-safe">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Logged
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ap-empty-state" style={{ padding: "48px 20px" }}>
            <div className="ap-empty-icon" style={{ width: 60, height: 60 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div style={{ textAlign: "center", maxWidth: "420px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#14213D", margin: "0 0 6px 0", fontFamily: "Outfit, sans-serif" }}>
                No Safety Alerts Recorded
              </h3>
              <p style={{ fontSize: "14px", color: "#64748B", margin: 0, lineHeight: 1.5, fontFamily: "Outfit, sans-serif" }}>
                Driver condition is safe and fully alert. Telemetry event logs and fatigue warnings will automatically appear here when anomalies occur.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
