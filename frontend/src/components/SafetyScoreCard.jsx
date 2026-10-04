import React from "react";

export function SafetyScoreCard({ score, safetyLevel, drowsinessData, distractionData }) {
  // Score color & label
  let scoreColor = "#16A34A";
  let scoreLabel = "EXCELLENT";
  if (score < 50) {
    scoreColor = "#DC2626";
    scoreLabel = "CRITICAL";
  } else if (score < 75) {
    scoreColor = "#F59E0B";
    scoreLabel = "WARNING";
  } else if (score < 90) {
    scoreColor = "#F97316";
    scoreLabel = "GOOD";
  }

  // Circular gauge offset: circumference = 2 * PI * 50 = ~314.16
  const dashOffset = 314.16 * (1 - score / 100);

  // Hero Status Display
  let heroIcon = "🟢";
  let heroText = "ALERT";
  let heroColor = "var(--safe-green)";
  let heroSub = "Driver is attentive and fully responsive";

  if (safetyLevel === "CRITICAL" || safetyLevel === "DROWSY") {
    heroIcon = "🔴";
    heroText = "CRITICAL ALERT";
    heroColor = "var(--danger-red)";
    heroSub = "Driver drowsiness / critical hazard detected";
  } else if (safetyLevel === "DISTRACTED") {
    heroIcon = "🟠";
    heroText = "ATTENTION NEEDED";
    heroColor = "var(--orange-primary)";
    heroSub = "Driver is distracted from the road";
  } else if (safetyLevel === "NO_FACE") {
    heroIcon = "⚪";
    heroText = "NO FACE TRACKED";
    heroColor = "var(--slate-muted)";
    heroSub = "Align head and face with the camera lens";
  }

  // Pill statuses
  const isClosed = drowsinessData?.prediction === "Closed";
  const isYawn = drowsinessData?.prediction === "yawn";
  const isDistracted = distractionData?.is_distracted;

  return (
    <div className="panel score-panel" aria-label="Driver Safety Score & Status">
      <div className="panel-header">
        <h2 className="ap-card-title-multicolor">DRIVER SAFETY SCORE</h2>
        <span className="badge-tag">AI Dynamic</span>
      </div>

      <div className="score-card-body">
        <div className="score-main-row">
          {/* Large Circular SVG Score Ring */}
          <div className="score-ring-container">
            <svg className="score-ring-svg" viewBox="0 0 120 120">
              <circle
                className="ring-bg"
                cx="60"
                cy="60"
                r="50"
                stroke="#F1F5F9"
                strokeWidth="10"
                fill="none"
              />
              <circle
                className="ring-fill"
                id="scoreRingFill"
                cx="60"
                cy="60"
                r="50"
                stroke={scoreColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray="314.16"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
              />
            </svg>
            <div className="score-center-text">
              <span className="score-number" id="scoreValue">{score}</span>
              <span className="score-out-of">/ 100</span>
              <span
                className="score-rating-label"
                id="scoreLabel"
                style={{ color: scoreColor }}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          {/* Prominent Current Driver Status Section */}
          <div className="driver-status-hero">
            <span className="hero-status-title">CURRENT DRIVER STATUS</span>
            <div className="hero-status-display" id="heroStatusDisplay">
              <span className="hero-status-icon" id="heroStatusIcon">{heroIcon}</span>
              <strong
                className="hero-status-text"
                id="heroStatusText"
                style={{ color: heroColor }}
              >
                {heroText}
              </strong>
            </div>
            <span className="hero-status-sub" id="heroStatusSub">{heroSub}</span>
          </div>
        </div>

        {/* Driver Status Telemetry Indicators Row */}
        <div className="driver-status-pills-row">
          <div className="status-pill-item" id="pillEyes">
            <span className={`pill-dot ${isClosed ? "danger" : "safe"}`}></span>
            <span className="pill-title">Eyes:</span>
            <strong
              className="pill-val"
              id="statusEyesText"
              style={{ color: isClosed ? "var(--danger-red-dark)" : "var(--safe-green-dark)" }}
            >
              {isClosed ? "CLOSED" : "OPEN"}
            </strong>
          </div>
          <div className="status-pill-item" id="pillYawn">
            <span className={`pill-dot ${isYawn ? "warn" : "safe"}`}></span>
            <span className="pill-title">Yawn:</span>
            <strong
              className="pill-val"
              id="statusYawnText"
              style={{ color: isYawn ? "var(--warn-orange-dark)" : "var(--safe-green-dark)" }}
            >
              {isYawn ? "DETECTED" : "NO YAWN"}
            </strong>
          </div>
          <div className="status-pill-item" id="pillDistract">
            <span className={`pill-dot ${isDistracted ? "danger" : "safe"}`}></span>
            <span className="pill-title">Focus:</span>
            <strong
              className="pill-val"
              id="statusDistractText"
              style={{ color: isDistracted ? "var(--danger-red-dark)" : "var(--safe-green-dark)" }}
            >
              {isDistracted ? "DISTRACTED" : "SAFE"}
            </strong>
          </div>
        </div>

        {/* Safety System Metrics Row (Symmetrical with other cards) */}
        <div className="timer-row">
          <div className="timer-cell">
            <span className="timer-label">Model</span>
            <strong>MobileNet</strong>
          </div>
          <div className="timer-cell">
            <span className="timer-label">Pipeline</span>
            <strong>Dual-AI</strong>
          </div>
          <div className="timer-cell">
            <span className="timer-label">Risk</span>
            <strong style={{ color: scoreColor }}>{scoreLabel}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
