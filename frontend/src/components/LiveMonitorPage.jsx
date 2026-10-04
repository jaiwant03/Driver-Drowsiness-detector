import React from "react";
import { LiveMonitor } from "./LiveMonitor";

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
  return (
    <div className="page-live-monitor">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Live Driver Monitoring</h1>
          <p className="page-subtitle">Real-time AI safety analysis</p>
        </div>
        <div className="page-header-right">
          <div className={`status-pill ${backendOnline ? "online" : "offline"}`}>
            <span className="status-pill-dot"></span>
            <span>{backendOnline ? "Online" : "Offline"}</span>
          </div>
          <div className="fps-display">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>{fps} FPS</span>
          </div>
        </div>
      </div>

      {/* Live Monitor Content */}
      <LiveMonitor
        videoRef={videoRef}
        canvasRef={canvasRef}
        monitoring={monitoring}
        safetyLevel={safetyLevel}
        latencyMs={latencyMs}
        currentScore={currentScore}
        drowsinessData={drowsinessData}
        distractionData={distractionData}
        sessionSeconds={sessionSeconds}
        onStart={onStart}
        onStop={onStop}
        onReset={onReset}
        onSnapshot={onSnapshot}
      />
    </div>
  );
}
