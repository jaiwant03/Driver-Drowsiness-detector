import React from "react";

export function CameraView({
  videoRef,
  canvasRef,
  monitoring,
  safetyLevel,
  latencyMs,
  drowsinessData,
  distractionData,
  fps,
  backendOnline,
}) {
  const isClosed    = drowsinessData?.prediction === "Closed";
  const isYawn      = drowsinessData?.prediction === "yawn";
  const isDistracted = distractionData?.is_distracted;
  const faceOk      = drowsinessData ? drowsinessData.face_detected : true;

  // Border color based on safety state
  let borderColor = "#E5E7EB"; // neutral
  if (safetyLevel === "CRITICAL") borderColor = "#DC2626";
  else if (safetyLevel === "DROWSY") borderColor = "#DC2626";
  else if (safetyLevel === "DISTRACTED") borderColor = "#F97316";
  else if (monitoring) borderColor = "#16A34A";

  return (
    <div className="cv-root" style={{ "--cv-border": borderColor }}>

      {/* ── Top bar: LIVE pill + safety badge + status + FPS ───── */}
      <div className="cv-topbar">
        <div className="cv-topbar-left">
          <span className="cv-live-pill">
            <span className="cv-live-dot" />
            LIVE
          </span>
          <span
            className={`cv-safety-badge cv-badge-${(safetyLevel || "standby").toLowerCase()}`}
          >
            {safetyLevel || "STANDBY"}
          </span>
        </div>
        <div className="cv-topbar-right">
          <span className={`cv-status-chip ${backendOnline ? "cv-chip-online" : "cv-chip-offline"}`}>
            {backendOnline ? "Backend Online" : "Backend Offline"}
          </span>
          <span className="cv-fps-chip">{fps ?? 0} FPS</span>
          {latencyMs !== null && latencyMs !== undefined && (
            <span className="cv-fps-chip">{latencyMs} ms</span>
          )}
        </div>
      </div>

      {/* ── Video area ──────────────────────────────────────────── */}
      <div className="cv-viewport">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="cv-video"
          aria-label="Webcam feed"
        />
        <canvas ref={canvasRef} hidden aria-hidden="true" />

        {/* Viewfinder corner accents */}
        <div className="cv-vf" aria-hidden="true">
          <div className="cv-corner cv-tl" />
          <div className="cv-corner cv-tr" />
          <div className="cv-corner cv-bl" />
          <div className="cv-corner cv-br" />
          {monitoring && <div className="cv-scanline" />}
        </div>

        {/* On-camera detection chips — only when monitoring */}
        {monitoring && (
          <div className="cv-detect-chips">
            <div className={`cv-dchip ${isClosed ? "cv-dchip-danger" : "cv-dchip-safe"}`}>
              <span>👁</span>
              <strong>{isClosed ? "EYES CLOSED" : "EYES OPEN"}</strong>
            </div>
            <div className={`cv-dchip ${isYawn ? "cv-dchip-warn" : "cv-dchip-safe"}`}>
              <span>🥱</span>
              <strong>{isYawn ? "YAWN" : "NO YAWN"}</strong>
            </div>
            <div className={`cv-dchip ${isDistracted ? "cv-dchip-danger" : "cv-dchip-safe"}`}>
              <span>🚗</span>
              <strong>
                {isDistracted
                  ? (distractionData?.prediction || "DISTRACTED").toUpperCase()
                  : "FOCUSED"}
              </strong>
            </div>
          </div>
        )}

        {/* Bottom-left monitoring status */}
        <div className="cv-bottom-bar">
          <span className="cv-monitor-status">
            <span className={`cv-status-dot ${monitoring ? "cv-dot-active" : ""}`} />
            {monitoring ? "MONITORING ACTIVE" : "STANDBY"}
          </span>
          <span
            className="cv-face-tag"
            style={{ color: faceOk ? "#60A5FA" : "#F87171" }}
          >
            {faceOk ? "FACE: TRACKED" : "FACE: NOT DETECTED"}
          </span>
        </div>

        {/* Placeholder when camera is off */}
        {!monitoring && (
          <div className="cv-placeholder">
            <div className="cv-placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                <rect x="2" y="6" width="14" height="12" rx="3" />
                <circle cx="9" cy="12" r="2.5" />
              </svg>
            </div>
            <h3 className="cv-placeholder-title">CAMERA READY</h3>
            <p className="cv-placeholder-sub">
              Press <strong>START MONITORING</strong> below to begin real-time AI analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
