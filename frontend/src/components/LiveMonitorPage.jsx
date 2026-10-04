import React from "react";
import { CameraView } from "./CameraView";
import { SafetyScoreCard } from "./SafetyScoreCard";
import { DrowsinessCard } from "./DrowsinessCard";
import { DistractionCard } from "./DistractionCard";

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

export function LiveMonitorPage({
  videoRef,
  canvasRef,
  monitoring,
  safetyLevel,
  latencyMs,
  currentScore,
  drowsinessData,
  distractionData,
  sessionSeconds,
  onStart,
  onStop,
  onReset,
  onSnapshot,
  backendOnline,
  fps,
}) {
  // Session timer string
  const hrs  = String(Math.floor(sessionSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(sessionSeconds % 60).padStart(2, "0");
  const timerStr = `${hrs}:${mins}:${secs}`;

  const isDrowsy = drowsinessData?.is_drowsy;
  const isDistracted = distractionData?.is_distracted;
  const isClosed = drowsinessData?.prediction === "Closed";
  const isYawn = drowsinessData?.prediction === "yawn";

  let drowsyStatusTxt = "WAITING";
  let drowsyValColor = "ap-val-teal";
  if (monitoring) {
    if (isClosed) {
      drowsyStatusTxt = "EYES CLOSED";
      drowsyValColor = "ap-val-red";
    } else if (isYawn) {
      drowsyStatusTxt = "YAWNING";
      drowsyValColor = "ap-val-orange";
    } else {
      drowsyStatusTxt = "EYES OPEN";
      drowsyValColor = "ap-val-teal";
    }
  }

  let distractStatusTxt = "WAITING";
  let distractValColor = "ap-val-teal";
  if (monitoring) {
    if (isDistracted) {
      distractStatusTxt = (distractionData?.prediction || "DISTRACTED").toUpperCase();
      distractValColor = "ap-val-orange";
    } else {
      distractStatusTxt = "FOCUSED";
      distractValColor = "ap-val-teal";
    }
  }

  const scoreColor = currentScore < 60 ? "#DC2626" : currentScore < 80 ? "#F59E0B" : "#10B981";

  return (
    <div className="ap-page lm-page">

      {/* ── Page Header with Multi-Color Live Monitor Title ───── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Live Monitor</h1>
            <p className="ap-subtitle">Real-time edge AI driver telemetry &amp; optical feed</p>
          </div>
        </div>
        <div className="ap-actions-wrap">
          <span className="ap-telemetry-tag">
            <span className="ap-pulse-dot" style={{ backgroundColor: monitoring ? "#10B981" : "#F59E0B" }} />
            {monitoring ? "OPTICAL STREAM ACTIVE" : "CAMERA STANDBY"}
          </span>
        </div>
      </div>

      {/* ── Live Monitor Intro Card ───────────────────────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">REAL-TIME OPTICAL VISION &amp; SAFETY TELEMETRY</div>
            <div className="ap-intro-subtitle">High-frequency dual neural vision pipeline tracking fatigue, micro-sleeps, and gaze departure</div>
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

      {/* ── Control Action Toolbar Card (At Top, Clean & Spaced) ── */}
      <div className="ap-card lm-toolbar-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "18px" }}>
          {/* Action Buttons Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="ap-btn ap-btn-primary"
              style={{ padding: "12px 24px", fontSize: "14px" }}
              onClick={onStart}
              disabled={monitoring}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{monitoring ? "MONITORING ACTIVE" : "START MONITORING"}</span>
            </button>

            <button
              className="ap-btn ap-btn-danger"
              style={{ padding: "12px 20px", fontSize: "13.5px" }}
              onClick={onStop}
              disabled={!monitoring}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              STOP
            </button>

            <button
              className="ap-btn ap-btn-secondary"
              style={{ padding: "12px 18px", fontSize: "13.5px" }}
              onClick={onReset}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              RESET
            </button>

            <button
              className="ap-btn ap-btn-secondary"
              style={{ padding: "12px 18px", fontSize: "13.5px" }}
              onClick={onSnapshot}
              title="Capture snapshot"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              SNAPSHOT
            </button>
          </div>

          {/* Right Status & Live Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="ap-tag ap-tag-info" style={{ padding: "8px 14px", fontSize: "12px" }}>
              <span className="ap-pulse-dot" style={{ backgroundColor: backendOnline ? "#10B981" : "#F59E0B" }} />
              {backendOnline ? "Backend Online" : "Backend Offline"}
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 15px", borderRadius: "10px", background: "#F8FAFC", border: "1px solid #DDE7EA", color: "#14213D", fontFamily: "ui-monospace, monospace", fontSize: "14px", fontWeight: "700" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007C83" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {timerStr}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Metric Cards Grid (Standardized Across App) ─── */}
      <div className="ap-kpi-grid">
        {/* Card 1: Monitoring State */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-peacock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span className="ap-kpi-label">MONITORING STATE</span>
          </div>
          <div className="ap-kpi-val" style={{ color: monitoring ? "#10B981" : "#64748B" }}>
            {monitoring ? "ACTIVE" : "STANDBY"}
          </div>
          <div className="ap-kpi-sub">{fps ?? 0} FPS • {latencyMs ?? 0}ms Latency</div>
          <CornerWave color={monitoring ? "#10B981" : "#007C83"} opacity={0.10} />
        </div>

        {/* Card 2: Driver Safety Score */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-teal" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="ap-kpi-label">SAFETY SCORE</span>
          </div>
          <div className="ap-kpi-val" style={{ color: scoreColor }}>
            {currentScore} <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748B" }}>/ 100</span>
          </div>
          <div className="ap-kpi-sub">{safetyLevel || "NOMINAL"} status</div>
          <CornerWave color={scoreColor} opacity={0.10} />
        </div>

        {/* Card 3: Drowsiness State */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className={`ap-kpi-icon ${isDrowsy ? "ap-icon-red" : "ap-icon-peacock"}`} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="ap-kpi-label">DROWSINESS STATE</span>
          </div>
          <div className={`ap-kpi-val ${drowsyValColor}`} style={{ fontSize: "24px" }}>
            {drowsyStatusTxt}
          </div>
          <div className="ap-kpi-sub">MobileNetV2 EAR analysis</div>
          <CornerWave color={isDrowsy ? "#DC2626" : "#007C83"} opacity={0.10} />
        </div>

        {/* Card 4: Gaze Attention */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className={`ap-kpi-icon ${isDistracted ? "ap-icon-orange" : "ap-icon-teal"}`} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="ap-kpi-label">GAZE ATTENTION</span>
          </div>
          <div className={`ap-kpi-val ${distractValColor}`} style={{ fontSize: "24px" }}>
            {distractStatusTxt}
          </div>
          <div className="ap-kpi-sub">ShuffleNetV2 pose tracking</div>
          <CornerWave color={isDistracted ? "#F59E0B" : "#00A6A6"} opacity={0.10} />
        </div>
      </div>

      {/* ── Detection Cards Grid (Up, Spaced) ─────────────────── */}
      <div className="lm-cards">
        <SafetyScoreCard
          score={currentScore}
          safetyLevel={safetyLevel}
          drowsinessData={drowsinessData}
          distractionData={distractionData}
        />
        <DrowsinessCard data={drowsinessData} />
        <DistractionCard data={distractionData} />
      </div>

      {/* ── Optical Video Stream (Kept DOWN at the Bottom) ─────── */}
      <div className="ap-card" style={{ padding: "20px 24px" }}>
        <div className="ap-card-header">
          <h2 className="ap-card-title">
            <span className="ap-card-title-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </span>
            <span className="ap-card-title-multicolor">Live Optical Camera Feed</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="ap-tag ap-tag-info" style={{ fontSize: "11px", padding: "2px 8px" }}>
              640x480 @ {fps ?? 30} FPS
            </span>
            <span className="ap-card-badge">Single Camera Stream</span>
          </div>
        </div>

        <div className="lm-camera-wrap" style={{ marginTop: "10px" }}>
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            monitoring={monitoring}
            safetyLevel={safetyLevel}
            latencyMs={latencyMs}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
            sessionSeconds={sessionSeconds}
            fps={fps}
            backendOnline={backendOnline}
          />
        </div>
      </div>

    </div>
  );
}
