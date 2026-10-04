import React from "react";

export function CameraView({
  videoRef,
  canvasRef,
  monitoring,
  safetyLevel,
  latencyMs,
  drowsinessData,
  distractionData,
  sessionSeconds,
  onStart,
  onStop,
  onReset,
  onSnapshot,
}) {
  const isClosed = drowsinessData?.prediction === "Closed";
  const isYawn = drowsinessData?.prediction === "yawn";
  const isDistracted = distractionData?.is_distracted;
  const faceOk = drowsinessData ? drowsinessData.face_detected : true;

  // Format timer
  const hrs = String(Math.floor(sessionSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(sessionSeconds % 60).padStart(2, "0");
  const timerStr = `${hrs}:${mins}:${secs}`;

  // Video wrap styling based on safety
  let wrapState = "active";
  if (safetyLevel === "CRITICAL") wrapState = "critical";
  else if (safetyLevel === "DROWSY") wrapState = "drowsy";
  else if (safetyLevel === "DISTRACTED") wrapState = "distracted";

  // Safety Badge class
  let badgeClass = "badge-muted";
  if (safetyLevel === "SAFE") badgeClass = "badge-safe";
  else if (safetyLevel === "DROWSY") badgeClass = "badge-danger";
  else if (safetyLevel === "DISTRACTED") badgeClass = "badge-warn";
  else if (safetyLevel === "CRITICAL") badgeClass = "badge-critical";

  const toggleFullscreen = () => {
    const el = document.getElementById("videoWrap");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="panel camera-panel" aria-label="Live Camera Feed">
      {/* Camera Card Header */}
      <div className="panel-header camera-header">
        <div className="panel-title">
          <span className="pulse-indicator"></span>
          <h2>LIVE CAMERA</h2>
          <span className="hdr-tag">Real-Time Driver Monitoring</span>
        </div>
        <div className="header-badges">
          <span className="live-pill" id="livePill">
            <span className="live-indicator"></span> LIVE
          </span>
          <span className={`safety-badge ${badgeClass}`} id="safetyBadge">
            {safetyLevel || "STANDBY"}
          </span>
          <button
            className="btn-icon-ghost"
            onClick={toggleFullscreen}
            title="Fullscreen Camera"
            aria-label="Fullscreen Camera"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Large Video Viewport */}
      <div className="camera-viewport-wrap">
        <div className={`video-wrap ${monitoring ? wrapState : ""}`} id="videoWrap">
          <video
            ref={videoRef}
            id="cameraFeed"
            autoPlay
            muted
            playsInline
            aria-label="Webcam feed"
          ></video>
          <canvas ref={canvasRef} id="captureCanvas" hidden aria-hidden="true"></canvas>

          {/* Corner Viewfinder Accents */}
          <div className="vf-overlay" aria-hidden="true">
            <div className="corner tl"></div>
            <div className="corner tr"></div>
            <div className="corner bl"></div>
            <div className="corner br"></div>
            {monitoring && <div className="scan-line" id="scanLine"></div>}
          </div>

          {/* On-Camera Live Status Overlay Panel */}
          {monitoring && (
            <div className="cam-overlay-status" id="camOverlayStatus">
              <div className={`cam-ov-chip ${isClosed ? "danger" : "safe"}`} id="camOvEyes">
                <span className="ov-icon">👁</span>
                <strong id="camOvEyesText">{isClosed ? "EYES CLOSED" : "EYES OPEN"}</strong>
              </div>
              <div className={`cam-ov-chip ${isYawn ? "warn" : "safe"}`} id="camOvYawn">
                <span className="ov-icon">🥱</span>
                <strong id="camOvYawnText">{isYawn ? "YAWN DETECTED" : "NO YAWN"}</strong>
              </div>
              <div className={`cam-ov-chip ${isDistracted ? "danger" : "safe"}`} id="camOvDistract">
                <span className="ov-icon">🚗</span>
                <strong id="camOvDistractText">
                  {isDistracted
                    ? (distractionData?.prediction || "DISTRACTED").toUpperCase()
                    : "NO DISTRACTION"}
                </strong>
              </div>
            </div>
          )}

          {/* Camera Telemetry Overlay Tags */}
          <div className="cam-overlay-bottom">
            <div className="video-status" id="videoStatus" aria-hidden="true">
              <span className="status-pulse-dot"></span>
              <span id="videoStatusText">{monitoring ? "MONITORING ACTIVE" : "STANDBY"}</span>
            </div>
            <div className="cam-telemetry-chips">
              <span
                className="cam-tag"
                id="camFaceTag"
                style={{ color: faceOk ? "#60A5FA" : "#F87171" }}
              >
                {faceOk ? "FACE: TRACKED" : "FACE: NO FACE"}
              </span>
              <span className="cam-tag tag-latency" id="camLatencyTag">
                {latencyMs !== null ? `${latencyMs} ms` : "— ms"}
              </span>
            </div>
          </div>

          {/* Attractive Standby State when camera is inactive */}
          {!monitoring && (
            <div className="camera-placeholder" id="cameraPlaceholder">
              <div className="placeholder-icon-wrap">
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                  <rect x="2" y="6" width="14" height="12" rx="3" />
                  <circle cx="9" cy="12" r="2.5" />
                </svg>
              </div>
              <h3 className="placeholder-title">CAMERA READY</h3>
              <p className="placeholder-sub">
                Start monitoring to begin real-time driver attention &amp; fatigue analysis.
              </p>
              <button
                className="btn btn-primary btn-large-start"
                onClick={onStart}
                id="btnPlaceholderStart"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                START MONITORING
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Large Camera Controls Strip */}
      <div className="camera-controls-strip">
        <div className="controls-left">
          <button
            className="btn btn-primary btn-ctrl"
            onClick={onStart}
            disabled={monitoring}
            id="btnStart"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            START MONITORING
          </button>
          <button
            className="btn btn-stop btn-ctrl"
            onClick={onStop}
            disabled={!monitoring}
            id="btnStop"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            STOP
          </button>
          <button className="btn btn-secondary btn-ctrl" onClick={onReset} id="btnReset">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            RESET
          </button>
          <button
            className="btn btn-snapshot btn-ctrl"
            onClick={onSnapshot}
            title="Capture Snapshot of current frame"
            id="btnCaptureSnapshot"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            SNAPSHOT
          </button>
        </div>
        <div className="controls-right">
          <span className="session-timer-pill" id="sessionTimerBadge" title="Session Duration">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span id="sessionTimer">{timerStr}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
