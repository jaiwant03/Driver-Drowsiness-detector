import React, { useState } from "react";

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

export function HistoryPage() {
  const [selectedSession, setSelectedSession] = useState(null);

  const sessions = [
    {
      id: 5,
      tripNo: "TRIP #05",
      date: "Today, 14:20",
      duration: "24:32",
      safetyScore: 82,
      events: 14,
      frames: "18,420",
      drowsy: 1,
      yawns: 4,
      distractions: 9,
      status: "Good",
    },
    {
      id: 4,
      tripNo: "TRIP #04",
      date: "Yesterday, 09:45",
      duration: "31:17",
      safetyScore: 91,
      events: 8,
      frames: "23,450",
      drowsy: 0,
      yawns: 2,
      distractions: 6,
      status: "Excellent",
    },
    {
      id: 3,
      tripNo: "TRIP #03",
      date: "2 days ago, 18:10",
      duration: "42:05",
      safetyScore: 76,
      events: 22,
      frames: "31,540",
      drowsy: 3,
      yawns: 8,
      distractions: 11,
      status: "Fair",
    },
    {
      id: 2,
      tripNo: "TRIP #02",
      date: "3 days ago, 11:30",
      duration: "18:43",
      safetyScore: 94,
      events: 4,
      frames: "14,050",
      drowsy: 0,
      yawns: 1,
      distractions: 3,
      status: "Excellent",
    },
    {
      id: 1,
      tripNo: "TRIP #01",
      date: "4 days ago, 16:55",
      duration: "29:12",
      safetyScore: 88,
      events: 11,
      frames: "21,900",
      drowsy: 1,
      yawns: 3,
      distractions: 7,
      status: "Good",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return "#10B981";
    if (score >= 75) return "#F59E0B";
    return "#DC2626";
  };

  const getScoreClass = (score) => {
    if (score >= 90) return "ap-score-high";
    if (score >= 75) return "ap-score-med";
    return "ap-score-low";
  };

  return (
    <div className="ap-page">
      {/* ── Page Header with Multi-Color Session History Title ── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Session History</h1>
            <p className="ap-subtitle">Historical driver monitoring logs &amp; past trip performance</p>
          </div>
        </div>
        <div className="ap-actions-wrap">
          <span className="ap-telemetry-tag">
            <span className="ap-pulse-dot" />
            5 TRIPS ARCHIVED
          </span>
          <button
            className="ap-btn ap-btn-secondary"
            onClick={() => alert("Exporting all historical session archives as CSV...")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export All History
          </button>
        </div>
      </div>

      {/* ── History Intro Card ─────────────────────────────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">HISTORICAL SESSION TELEMETRY &amp; RECORDS</div>
            <div className="ap-intro-subtitle">Archive of past driving trips with duration, safety scores, and recorded fatigue events</div>
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

      {/* ── 4 KPI Summary Cards Grid ──────────────────────────── */}
      <div className="ap-kpi-grid">
        {/* Card 1: Total Trips */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-peacock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="ap-kpi-label">TOTAL SESSIONS</span>
          </div>
          <div className="ap-kpi-val ap-val-navy">5 Trips</div>
          <div className="ap-kpi-sub">Logged in local archive</div>
          <CornerWave color="#007C83" opacity={0.10} />
        </div>

        {/* Card 2: Average Score */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-teal" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="ap-kpi-label">AVERAGE SCORE</span>
          </div>
          <div className="ap-kpi-val ap-val-teal">86.2%</div>
          <div className="ap-kpi-sub">Composite fleet safety</div>
          <CornerWave color="#00A6A6" opacity={0.10} />
        </div>

        {/* Card 3: Monitored Time */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-peacock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="ap-kpi-label">MONITORED TIME</span>
          </div>
          <div className="ap-kpi-val ap-val-navy">2h 26m</div>
          <div className="ap-kpi-sub">Total active telemetry</div>
          <CornerWave color="#005F63" opacity={0.10} />
        </div>

        {/* Card 4: Events Handled */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-orange" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span className="ap-kpi-label">EVENTS MITIGATED</span>
          </div>
          <div className="ap-kpi-val ap-val-orange">59 Total</div>
          <div className="ap-kpi-sub">Fatigue &amp; distraction alerts</div>
          <CornerWave color="#F59E0B" opacity={0.10} />
        </div>
      </div>

      {/* ── Historical Sessions List Card ─────────────────────── */}
      <div className="ap-card">
        <div className="ap-card-header">
          <h2 className="ap-card-title">
            <span className="ap-card-title-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <span className="ap-card-title-multicolor">Archived Trips &amp; Sessions</span>
          </h2>
          <span className="ap-card-badge">Showing 5 of 5</span>
        </div>

        <div className="ap-history-list">
          {sessions.map((session) => {
            const isExpanded = selectedSession === session.id;
            return (
              <div key={session.id} className="ap-history-item">
                <div className="ap-history-grid-row">
                  {/* Col 1: Date & Badge */}
                  <div className="ap-history-left">
                    <div className="ap-history-calendar-badge" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="ap-history-date-wrap">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="ap-tag ap-tag-info" style={{ padding: "1px 6px", fontSize: "10.5px" }}>
                          {session.tripNo}
                        </span>
                        <h3>{session.date}</h3>
                      </div>
                      <p>{session.frames} frames processed</p>
                    </div>
                  </div>

                  {/* Col 2: Duration */}
                  <div className="ap-history-stat-unit">
                    <span className="ap-history-stat-lbl">Duration</span>
                    <span className="ap-history-stat-val" style={{ color: "#14213D" }}>
                      {session.duration}
                    </span>
                  </div>

                  {/* Col 3: Safety Score */}
                  <div className="ap-history-stat-unit">
                    <span className="ap-history-stat-lbl">Safety Score</span>
                    <span className="ap-history-stat-val" style={{ color: getScoreColor(session.safetyScore) }}>
                      {session.safetyScore}
                      <span className={`ap-score-pill ${getScoreClass(session.safetyScore)}`} style={{ fontSize: "11px", padding: "1px 6px" }}>
                        {session.status}
                      </span>
                    </span>
                  </div>

                  {/* Col 4: Events Logged */}
                  <div className="ap-history-stat-unit">
                    <span className="ap-history-stat-lbl">Events Logged</span>
                    <span className="ap-history-stat-val" style={{ color: "#334155" }}>
                      {session.events}
                      <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "600" }}>alerts</span>
                    </span>
                  </div>

                  {/* Col 5: Expand Action */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="ap-btn ap-btn-secondary"
                      onClick={() => setSelectedSession(isExpanded ? null : session.id)}
                      style={{ padding: "6px 14px", fontSize: "12.5px" }}
                    >
                      <span>{isExpanded ? "Hide" : "Details"}</span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div className="ap-history-drawer">
                    <div className="ap-history-drawer-item">
                      <span className="ap-history-drawer-lbl">Drowsy Closures</span>
                      <span className="ap-history-drawer-val" style={{ color: session.drowsy > 0 ? "#DC2626" : "#10B981" }}>
                        {session.drowsy} incidents
                      </span>
                    </div>
                    <div className="ap-history-drawer-item">
                      <span className="ap-history-drawer-lbl">Yawn Episodes</span>
                      <span className="ap-history-drawer-val" style={{ color: session.yawns > 0 ? "#F59E0B" : "#10B981" }}>
                        {session.yawns} detected
                      </span>
                    </div>
                    <div className="ap-history-drawer-item">
                      <span className="ap-history-drawer-lbl">Gaze Departures</span>
                      <span className="ap-history-drawer-val" style={{ color: session.distractions > 0 ? "#007C83" : "#10B981" }}>
                        {session.distractions} departures
                      </span>
                    </div>
                    <div className="ap-history-drawer-item">
                      <span className="ap-history-drawer-lbl">Sensor Pipeline</span>
                      <span className="ap-history-drawer-val" style={{ color: "#007C83" }}>
                        640x480 @ 30 FPS
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
