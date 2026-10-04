import React from "react";

export function DashboardPage({
  safetyLevel,
  safetyMessage,
  currentScore,
  sessionSeconds,
  maxFrames,
  drowsyEvents,
  yawnEvents,
  distractEvents,
  drowsinessData,
  distractionData,
}) {
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getSafetyStatus = () => {
    if (safetyLevel === "SAFE") return { icon: "🟢", text: "Driver Safe", color: "#16A34A" };
    if (safetyLevel === "DROWSY") return { icon: "🟠", text: "Drowsiness Detected", color: "#F59E0B" };
    if (safetyLevel === "DISTRACTED") return { icon: "🟡", text: "Distraction Detected", color: "#F97316" };
    if (safetyLevel === "CRITICAL") return { icon: "🔴", text: "Critical Alert", color: "#DC2626" };
    return { icon: "⚪", text: "Standby", color: "#64748B" };
  };

  const status = getSafetyStatus();

  return (
    <div className="page-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{getGreeting()}</h1>
          <p className="page-subtitle">DriverGuard Safety Dashboard</p>
        </div>
      </div>

      {/* Current Status Banner */}
      <div className="dashboard-status-banner" style={{ borderLeftColor: status.color }}>
        <div className="status-banner-icon">{status.icon}</div>
        <div className="status-banner-content">
          <div className="status-banner-title" style={{ color: status.color }}>
            {status.text}
          </div>
          <div className="status-banner-message">{safetyMessage}</div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="dashboard-metrics-grid">
        {/* Safety Score */}
        <div className="dashboard-metric-card highlight">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="metric-title">Safety Score</span>
          </div>
          <div className="metric-value-large">{currentScore}</div>
          <div className="metric-subtitle">out of 100</div>
          <div className="metric-status-bar">
            <div
              className="metric-status-fill"
              style={{
                width: `${currentScore}%`,
                backgroundColor: currentScore >= 80 ? "#16A34A" : currentScore >= 60 ? "#F97316" : "#DC2626",
              }}
            ></div>
          </div>
        </div>

        {/* Session Time */}
        <div className="dashboard-metric-card">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="metric-title">Session Time</span>
          </div>
          <div className="metric-value">{formatTime(sessionSeconds)}</div>
          <div className="metric-subtitle">Duration</div>
        </div>

        {/* Frames Analyzed */}
        <div className="dashboard-metric-card">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="metric-title">Frames Analyzed</span>
          </div>
          <div className="metric-value">{maxFrames.toLocaleString()}</div>
          <div className="metric-subtitle">Total frames</div>
        </div>

        {/* Drowsiness Events */}
        <div className="dashboard-metric-card">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="metric-title">Drowsy Events</span>
          </div>
          <div className="metric-value">{drowsyEvents}</div>
          <div className="metric-subtitle">Detected</div>
        </div>

        {/* Yawn Events */}
        <div className="dashboard-metric-card">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span className="metric-title">Yawns</span>
          </div>
          <div className="metric-value">{yawnEvents}</div>
          <div className="metric-subtitle">Detected</div>
        </div>

        {/* Distraction Events */}
        <div className="dashboard-metric-card">
          <div className="metric-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="metric-title">Distraction Events</span>
          </div>
          <div className="metric-value">{distractEvents}</div>
          <div className="metric-subtitle">Detected</div>
        </div>
      </div>

      {/* Current Detection States */}
      <div className="dashboard-section-title">Current Detection Status</div>
      <div className="dashboard-detection-grid">
        {/* Drowsiness */}
        <div className="dashboard-detection-card">
          <div className="detection-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Drowsiness Detection</span>
          </div>
          <div className="detection-card-body">
            <div className="detection-main-status">
              {drowsinessData?.prediction || "Monitoring"}
            </div>
            <div className="detection-confidence">
              Confidence: {drowsinessData?.confidence ? `${(drowsinessData.confidence * 100).toFixed(1)}%` : "—"}
            </div>
            {drowsinessData?.drowsy_elapsed_seconds > 0 && (
              <div className="detection-duration">
                Duration: {drowsinessData.drowsy_elapsed_seconds.toFixed(1)}s
              </div>
            )}
          </div>
        </div>

        {/* Distraction */}
        <div className="dashboard-detection-card">
          <div className="detection-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Distraction Detection</span>
          </div>
          <div className="detection-card-body">
            <div className="detection-main-status">
              {distractionData?.prediction || "Monitoring"}
            </div>
            <div className="detection-confidence">
              Confidence: {distractionData?.confidence ? `${(distractionData.confidence * 100).toFixed(1)}%` : "—"}
            </div>
            {distractionData?.distracted_elapsed_seconds > 0 && (
              <div className="detection-duration">
                Duration: {distractionData.distracted_elapsed_seconds.toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
