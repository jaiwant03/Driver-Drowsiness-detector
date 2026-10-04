import React from "react";

function CornerWave({ color, opacity = 0.08 }) {
  return (
    <svg
      className="db-card-corner-wave"
      viewBox="0 0 180 90"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 60 C50 38 100 75 180 28 L180 90 L0 90 Z"
        fill={color}
        fillOpacity={opacity}
      />
      <path
        d="M40 70 C85 52 130 78 180 48 L180 90 L40 90 Z"
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
        d="M0 45 C220 18 480 65 800 30 L800 80 L0 80 Z"
        fill="#0D9488"
        fillOpacity="0.05"
      />
      <path
        d="M160 55 C360 26 600 68 800 45 L800 80 L160 80 Z"
        fill="#0D9488"
        fillOpacity="0.035"
      />
    </svg>
  );
}

function DetectionWave() {
  return (
    <svg
      className="db-detect-wave"
      viewBox="0 0 500 80"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 48 C140 22 300 68 500 28 L500 80 L0 80 Z"
        fill="#0D9488"
        fillOpacity="0.06"
      />
      <path
        d="M90 58 C230 34 370 72 500 42 L500 80 L90 80 Z"
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
          <p className="db-hero-sub">
            <span className="db-hero-brand-multi">DriverGuard</span> Safety Dashboard
          </p>
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
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="dbBannerMultiShield" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="35%" stopColor="#10B981" />
                <stop offset="70%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF4081" />
              </linearGradient>
            </defs>
            <path
              d="M16 3L5 7.5V15C5 22.2 9.7 28 16 29.5C22.3 28 27 22.2 27 15V7.5L16 3Z"
              stroke="url(#dbBannerMultiShield)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="url(#dbBannerMultiShield)"
              fillOpacity="0.14"
            />
            <path
              d="M16 7.5L9 11V15C9 20 12 24.5 16 25.8C20 24.5 23 20 23 15V11L16 7.5Z"
              stroke="url(#dbBannerMultiShield)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
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
          <CornerWave color="#00D2B4" opacity={0.14} />
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
          <CornerWave color="#00A3FF" opacity={0.12} />
        </div>

        {/* Card 3: Frames Analyzed */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-indigo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <span className="db-card-label">Frames Analyzed</span>
          </div>
          <div className="db-card-val-navy">{maxFrames.toLocaleString()}</div>
          <div className="db-card-sub">Total frames</div>
          <CornerWave color="#3B82F6" opacity={0.12} />
        </div>

        {/* Card 4: Drowsy Events */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-amber">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="db-card-label">Drowsy Events</span>
          </div>
          <div className="db-card-val-navy">{drowsyEvents}</div>
          <div className="db-card-sub">Detected</div>
          <CornerWave color="#FF9100" opacity={0.14} />
        </div>
      </div>

      {/* ── Metric Cards: Row 2 (Yawns & Distraction Events) ── */}
      <div className="db-metrics-grid">
        {/* Card 5: Yawns */}
        <div className="db-card">
          <div className="db-card-header">
            <div className="db-card-icon db-icon-purple">
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
          <CornerWave color="#A855F7" opacity={0.13} />
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
          <CornerWave color="#FF3B30" opacity={0.13} />
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
