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
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning!";
    if (h < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  // Status banner
  let bannerIcon = null;
  let bannerTitle = "Driver Safe";
  let bannerMsg   = "Driver is Attentive & Alert";
  let bannerCls   = "db-banner-safe";

  if (safetyLevel === "DROWSY") {
    bannerCls   = "db-banner-danger";
    bannerTitle = "Drowsiness Detected";
    bannerMsg   = safetyMessage || "Driver appears drowsy — please stay alert.";
  } else if (safetyLevel === "DISTRACTED") {
    bannerCls   = "db-banner-warn";
    bannerTitle = "Distraction Detected";
    bannerMsg   = safetyMessage || "Driver appears distracted from the road.";
  } else if (safetyLevel === "CRITICAL") {
    bannerCls   = "db-banner-danger";
    bannerTitle = "Critical Safety Alert";
    bannerMsg   = safetyMessage || "Driver is drowsy AND distracted — stop safely.";
  }

  const scoreBarColor =
    currentScore >= 80 ? "#16A34A" : currentScore >= 60 ? "#F97316" : "#DC2626";

  return (
    <div className="db-page">

      {/* ── Hero banner with road/car background ─────────────── */}
      <div className="db-hero">
        <div className="db-hero-text">
          <h1 className="db-hero-greeting">{getGreeting()}</h1>
          <p className="db-hero-sub">DriverGuard Safety Dashboard</p>
        </div>
        {/* SVG car illustration */}
        <div className="db-hero-car" aria-hidden="true">
          <svg viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* road */}
            <ellipse cx="110" cy="82" rx="100" ry="8" fill="rgba(14,165,233,0.10)"/>
            {/* body */}
            <rect x="20" y="38" width="180" height="36" rx="10" fill="#E0F2FE"/>
            {/* roof */}
            <path d="M60 38 Q75 14 145 14 Q165 14 175 38Z" fill="#BAE6FD"/>
            {/* windows */}
            <path d="M68 38 Q78 20 108 18 L108 38Z" fill="white" opacity="0.7"/>
            <path d="M112 38 L112 17 Q138 16 152 38Z" fill="white" opacity="0.7"/>
            {/* wheels */}
            <circle cx="58"  cy="74" r="14" fill="#334155"/>
            <circle cx="58"  cy="74" r="7"  fill="#94A3B8"/>
            <circle cx="162" cy="74" r="14" fill="#334155"/>
            <circle cx="162" cy="74" r="7"  fill="#94A3B8"/>
            {/* headlight */}
            <ellipse cx="198" cy="52" rx="6" ry="4" fill="#FEF08A" opacity="0.9"/>
            {/* tail-light */}
            <ellipse cx="22" cy="52" rx="5" ry="4" fill="#FCA5A5" opacity="0.8"/>
            {/* stripe */}
            <rect x="20" y="56" width="180" height="4" rx="2" fill="#7DD3FC" opacity="0.4"/>
          </svg>
        </div>
        {/* road horizon */}
        <div className="db-hero-road" aria-hidden="true" />
      </div>

      {/* ── Status banner ─────────────────────────────────────── */}
      <div className={`db-banner ${bannerCls}`}>
        <div className="db-banner-icon-wrap">
          {safetyLevel === "SAFE" || !safetyLevel ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        </div>
        <div className="db-banner-body">
          <span className="db-banner-title">{bannerTitle}</span>
          <span className="db-banner-msg">{bannerMsg}</span>
        </div>
        <div className="db-banner-shield">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      </div>

      {/* ── Top 4 metric cards ────────────────────────────────── */}
      <div className="db-metrics-top">
        {/* Safety Score */}
        <div className="db-card db-card-score">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="db-card-label">Safety Score</span>
          </div>
          <div className="db-card-value">{currentScore} <span className="db-card-unit">out of 100</span></div>
          <div className="db-card-sub">Score</div>
          <div className="db-score-bar">
            <div className="db-score-fill" style={{ width: `${currentScore}%`, background: scoreBarColor }} />
          </div>
        </div>

        {/* Session Time */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="db-card-label">Session Time</span>
          </div>
          <div className="db-card-value db-mono">{formatTime(sessionSeconds)}</div>
          <div className="db-card-sub">Duration</div>
        </div>

        {/* Frames Analyzed */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <span className="db-card-label">Frames Analyzed</span>
          </div>
          <div className="db-card-value">{maxFrames.toLocaleString()}</div>
          <div className="db-card-sub">Total frames</div>
        </div>

        {/* Drowsy Events */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="db-card-label">Drowsy Events</span>
          </div>
          <div className="db-card-value">{drowsyEvents}</div>
          <div className="db-card-sub">Detected</div>
        </div>
      </div>

      {/* ── Bottom 2 metric cards ─────────────────────────────── */}
      <div className="db-metrics-bottom">
        {/* Yawns */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <span className="db-card-label">Yawns</span>
          </div>
          <div className="db-card-value">{yawnEvents}</div>
          <div className="db-card-sub">Detected</div>
        </div>

        {/* Distraction Events */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="db-card-label">Distraction Events</span>
          </div>
          <div className="db-card-value">{distractEvents}</div>
          <div className="db-card-sub">Detected</div>
        </div>
      </div>

      {/* ── Current Detection Status ──────────────────────────── */}
      <h2 className="db-section-title">Current Detection Status</h2>
      <div className="db-detection-row">
        {/* Drowsiness */}
        <div className="db-detect-card">
          <div className="db-detect-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="db-detect-label">Drowsiness Detection</span>
          </div>
          <div className={`db-detect-status ${drowsinessData?.is_drowsy ? "db-detect-danger" : "db-detect-ok"}`}>
            {drowsinessData?.prediction || "Monitoring"}
          </div>
          <div className="db-detect-conf">
            Confidence: {drowsinessData?.confidence
              ? `${Number(drowsinessData.confidence).toFixed(1)}%`
              : "—"}
          </div>
        </div>

        {/* Distraction */}
        <div className="db-detect-card">
          <div className="db-detect-header">
            <div className="db-card-icon db-icon-red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="db-detect-label">Distraction Detection</span>
          </div>
          <div className={`db-detect-status ${distractionData?.is_distracted ? "db-detect-danger" : "db-detect-ok"}`}>
            {distractionData?.prediction || "Monitoring"}
          </div>
          <div className="db-detect-conf">
            Confidence: {distractionData?.confidence
              ? `${Number(distractionData.confidence).toFixed(1)}%`
              : "—"}
          </div>
        </div>
      </div>

    </div>
  );
}
