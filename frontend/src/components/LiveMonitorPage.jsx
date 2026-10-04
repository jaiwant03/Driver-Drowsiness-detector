import React from "react";
import { CameraView } from "./CameraView";
import { SafetyScoreCard } from "./SafetyScoreCard";
import { DrowsinessCard } from "./DrowsinessCard";
import { DistractionCard } from "./DistractionCard";

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

  return (
    <div className="lm-page">

      {/* ── Camera ──────────────────────────────────────────────── */}
      <div className="lm-camera-wrap">
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

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="lm-controls">
        {/* START — biggest button */}
        <button
          className="lm-btn-start"
          onClick={onStart}
          disabled={monitoring}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          START MONITORING
        </button>

        {/* STOP + RESET — medium row */}
        <div className="lm-btn-row">
          <button
            className="lm-btn-stop"
            onClick={onStop}
            disabled={!monitoring}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            STOP
          </button>

          <button className="lm-btn-reset" onClick={onReset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            RESET
          </button>

          <button
            className="lm-btn-snapshot"
            onClick={onSnapshot}
            title="Capture snapshot"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            SNAPSHOT
          </button>

          {/* Session timer pill — right-aligned */}
          <span className="lm-timer-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {timerStr}
          </span>
        </div>
      </div>

      {/* ── Detection Cards ─────────────────────────────────────── */}
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

    </div>
  );
}
