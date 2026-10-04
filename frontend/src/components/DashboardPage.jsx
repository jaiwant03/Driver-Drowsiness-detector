import React from "react";

function CornerWave({ color, opacity = 0.08 }) {
  return (
    <svg
      className="db-card-corner-wave"
      viewBox="0 0 160 80"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 55 C45 35 90 70 160 25 L160 80 L0 80 Z"
        fill={color}
        fillOpacity={opacity}
      />
      <path
        d="M35 65 C75 48 115 72 160 42 L160 80 L35 80 Z"
        fill={color}
        fillOpacity={opacity * 0.75}
      />
    </svg>
  );
}

function BannerWave() {
  return (
    <svg
      className="db-banner-wave"
      viewBox="0 0 800 80"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 45 C200 15 450 65 800 30 L800 80 L0 80 Z"
        fill="#0D9488"
        fillOpacity="0.05"
      />
      <path
        d="M150 55 C350 25 580 68 800 45 L800 80 L150 80 Z"
        fill="#0D9488"
        fillOpacity="0.04"
      />
    </svg>
  );
}

function DetectionWave() {
  return (
    <svg
      className="db-detect-wave"
      viewBox="0 0 450 70"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 42 C120 18 260 58 450 24 L450 70 L0 70 Z"
        fill="#0D9488"
        fillOpacity="0.05"
      />
      <path
        d="M80 50 C200 28 320 62 450 36 L450 70 L80 70 Z"
        fill="#0D9488"
        fillOpacity="0.04"
      />
    </svg>
  );
}

export function DashboardPage({
  safetyLevel,
  safetyMessage,
  currentScore = 100,
  sessionSeconds = 0,
  maxFrames = 0,
  drowsyEvents = 0,
  yawnEvents = 0,
  distractEvents = 0,
  drowsinessData,
  distractionData,
}) {
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning!";
    if (h < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  // Status banner styling & messages
  let bannerTitle = "Driver Safe";
  let bannerMsg = "Driver is Attentive & Alert";
  let isSafe = true;

  if (safetyLevel === "DROWSY") {
    bannerTitle = "Drowsiness Detected";
    bannerMsg = safetyMessage || "Driver appears drowsy — please stay alert.";
    isSafe = false;
  } else if (safetyLevel === "DISTRACTED") {
    bannerTitle = "Distraction Detected";
    bannerMsg = safetyMessage || "Driver appears distracted from the road.";
    isSafe = false;
  } else if (safetyLevel === "CRITICAL") {
    bannerTitle = "Critical Safety Alert";
    bannerMsg = safetyMessage || "Driver is drowsy AND distracted — stop safely.";
    isSafe = false;
  }

  const scoreBarColor =
    currentScore >= 80 ? "#10B981" : currentScore >= 60 ? "#F59E0B" : "#DC2626";

  return (
    <div className="db-page">

      {/* ── Top Header with Scenic Highway & Car Banner ──────── */}
      <div className="db-hero-header">
        <div className="db-hero-text">
          <h1 className="db-hero-greeting">{getGreeting()}</h1>
          <p className="db-hero-sub">DriverGuard Safety Dashboard</p>
        </div>
        <div className="db-hero-scenic" aria-hidden="true">
          <img
            src="/scenic-car-header.jpg"
            alt="Scenic road illustration with white car"
            className="db-scenic-img"
          />
        </div>
      </div>

      {/* ── Status Banner ("Driver Safe") ────────────────────── */}
      <div className={`db-status-banner ${isSafe ? "db-banner-safe" : "db-banner-alert"}`}>
        <div className="db-banner-left-indicator" />

        <div className="db-banner-icon-circle">
          {isSafe ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>

        <div className="db-banner-content">
          <div className="db-banner-heading">{bannerTitle}</div>
          <div className="db-banner-desc">{bannerMsg}</div>
        </div>

        <BannerWave />

        <div className="db-banner-watermark" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </div>

      {/* ── Metric Cards: Row 1 (4 columns) ─────────────────── */}
      <div className="db-metrics-grid">
        {/* Card 1: Safety Score */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="db-card-label">Safety Score</span>
          </div>
          <div className="db-score-row">
            <span className="db-card-val-teal">{currentScore}</span>
            <span className="db-card-unit">out of 100</span>
          </div>
          <div className="db-score-track">
            <div
              className="db-score-fill"
              style={{ width: `${Math.min(100, Math.max(0, currentScore))}%`, background: scoreBarColor }}
            />
          </div>
          <CornerWave color="#0D9488" opacity={0.09} />
        </div>

        {/* Card 2: Session Time */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-blue">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="db-card-label">Session Time</span>
          </div>
          <div className="db-card-val-navy">{formatTime(sessionSeconds)}</div>
          <div className="db-card-sub">Duration</div>
          <CornerWave color="#0EA5E9" opacity={0.08} />
        </div>

        {/* Card 3: Frames Analyzed */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-blue">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="db-card-label">Frames Analyzed</span>
          </div>
          <div className="db-card-val-navy">{maxFrames.toLocaleString()}</div>
          <div className="db-card-sub">Total frames</div>
          <CornerWave color="#0EA5E9" opacity={0.07} />
        </div>

        {/* Card 4: Drowsy Events */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-cyan">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="db-card-label">Drowsy Events</span>
          </div>
          <div className="db-card-val-navy">{drowsyEvents}</div>
          <div className="db-card-sub">Detected</div>
          <CornerWave color="#F97316" opacity={0.08} />
        </div>
      </div>

      {/* ── Metric Cards: Row 2 (Yawns & Distraction Events) ── */}
      <div className="db-metrics-grid">
        {/* Card 5: Yawns */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-blue">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <span className="db-card-label">Yawns</span>
          </div>
          <div className="db-card-val-navy">{yawnEvents}</div>
          <div className="db-card-sub">Detected</div>
          <CornerWave color="#8B5CF6" opacity={0.07} />
        </div>

        {/* Card 6: Distraction Events */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-red">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="db-card-label">Distraction Events</span>
          </div>
          <div className="db-card-val-navy">{distractEvents}</div>
          <div className="db-card-sub">Detected</div>
          <CornerWave color="#EF4444" opacity={0.08} />
        </div>

        {/* Empty placeholder cells to maintain strict 4-column alignment */}
        <div className="db-card-placeholder" />
        <div className="db-card-placeholder" />
      </div>

      {/* ── Current Detection Status ──────────────────────────── */}
      <h2 className="db-section-heading">Current Detection Status</h2>

      <div className="db-detect-grid">
        {/* Drowsiness Detection */}
        <div className="db-detect-card">
          <div className="db-detect-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="db-detect-label">Drowsiness Detection</span>
          </div>
          <div className={`db-detect-status ${drowsinessData?.is_drowsy ? "db-status-danger" : "db-status-teal"}`}>
            {drowsinessData?.prediction || "Monitoring"}
          </div>
          <div className="db-detect-conf">
            Confidence: {drowsinessData?.confidence ? `${Number(drowsinessData.confidence).toFixed(1)}%` : "—"}
          </div>
          <DetectionWave />
        </div>

        {/* Distraction Detection */}
        <div className="db-detect-card">
          <div className="db-detect-header">
            <div className="db-card-icon db-icon-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="db-detect-label">Distraction Detection</span>
          </div>
          <div className={`db-detect-status ${distractionData?.is_distracted ? "db-status-danger" : "db-status-teal"}`}>
            {distractionData?.prediction || "Monitoring"}
          </div>
          <div className="db-detect-conf">
            Confidence: {distractionData?.confidence ? `${Number(distractionData.confidence).toFixed(1)}%` : "—"}
          </div>
          <DetectionWave />
        </div>
      </div>

    </div>
  );
}
