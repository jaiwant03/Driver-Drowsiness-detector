import React, { useState } from "react";

export function SettingsPage({ settings, setSettings }) {
  const [sensitivity, setSensitivity] = useState("Balanced");
  const [gazeThreshold, setGazeThreshold] = useState("2.5s");
  const [autoSnapshot, setAutoSnapshot] = useState(true);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVolumeChange = (e) => {
    setSettings((prev) => ({ ...prev, volume: parseFloat(e.target.value) }));
  };

  const resetDefaults = () => {
    setSettings({
      voiceEnabled: true,
      visualEnabled: true,
      criticalEnabled: true,
      volume: 0.8,
    });
    setSensitivity("Balanced");
    setGazeThreshold("2.5s");
    setAutoSnapshot(true);
  };

  return (
    <div className="ap-page">
      {/* ── Page Header with Multi-Color Settings Title ────────── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Settings</h1>
            <p className="ap-subtitle">Configure monitoring thresholds, alert preferences, and system behavior</p>
          </div>
        </div>
        <div className="ap-actions-wrap">
          <span className="ap-telemetry-tag">
            <span className="ap-pulse-dot" />
            SYSTEM ACTIVE
          </span>
          <button className="ap-btn ap-btn-secondary" onClick={resetDefaults}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset Defaults
          </button>
        </div>
      </div>

      {/* ── Settings Intro Card ─────────────────────────────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">PREFERENCES &amp; SAFETY THRESHOLDS</div>
            <div className="ap-intro-subtitle">Customize audio-visual warnings, notification channels, and monitoring sensitivity</div>
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

      {/* ── Settings Sections Grid ────────────────────────────── */}
      <div className="ap-settings-grid">
        {/* Card 1: Monitoring & Alerts */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              Monitoring &amp; Alert Preferences
            </h2>
            <span className="ap-card-badge">Alert Engine</span>
          </div>

          {/* Setting Row: Voice Alerts */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Spoken Voice Warnings</span>
              <span className="ap-setting-sub">Real-time synthesized speech warnings during critical fatigue or sleep events</span>
            </div>
            <button
              className={`ap-switch ${settings.voiceEnabled ? "active" : ""}`}
              onClick={() => toggleSetting("voiceEnabled")}
              role="switch"
              aria-checked={settings.voiceEnabled}
              aria-label="Toggle spoken voice warnings"
            >
              <span className="ap-switch-track" />
              <span className="ap-switch-thumb" />
            </button>
          </div>

          {/* Setting Row: Visual Alerts */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">On-Screen Visual Banners</span>
              <span className="ap-setting-sub">High-contrast alert banners on top of the dashboard and live monitoring view</span>
            </div>
            <button
              className={`ap-switch ${settings.visualEnabled ? "active" : ""}`}
              onClick={() => toggleSetting("visualEnabled")}
              role="switch"
              aria-checked={settings.visualEnabled}
              aria-label="Toggle on-screen visual banners"
            >
              <span className="ap-switch-track" />
              <span className="ap-switch-thumb" />
            </button>
          </div>

          {/* Setting Row: Critical Modal */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Critical Emergency Modal</span>
              <span className="ap-setting-sub">Full-screen flashing takeover modal requiring driver acknowledgement during hazardous events</span>
            </div>
            <button
              className={`ap-switch ${settings.criticalEnabled ? "active" : ""}`}
              onClick={() => toggleSetting("criticalEnabled")}
              role="switch"
              aria-checked={settings.criticalEnabled}
              aria-label="Toggle critical emergency modal"
            >
              <span className="ap-switch-track" />
              <span className="ap-switch-thumb" />
            </button>
          </div>

          {/* Setting Row: Volume Slider */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Alert Sound Volume</span>
              <span className="ap-setting-sub">Master volume level for acoustic sirens and synthesized voice alerts</span>
            </div>
            <div className="ap-volume-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007C83" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={handleVolumeChange}
                className="ap-volume-slider"
                aria-label="Alert volume level"
              />
              <span className="ap-volume-pct-pill">{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Detection Sensitivity & Thresholds */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              AI Detection Sensitivity &amp; Thresholds
            </h2>
            <span className="ap-card-badge">Neural Filter</span>
          </div>

          {/* Sensitivity Setting */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Fatigue Classifier Sensitivity</span>
              <span className="ap-setting-sub">EAR (Eye Aspect Ratio) trigger strictness and temporal closure threshold</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Conservative", "Balanced", "Strict"].map((lvl) => (
                <button
                  key={lvl}
                  className={`ap-btn ${sensitivity === lvl ? "ap-btn-primary" : "ap-btn-secondary"}`}
                  style={{ padding: "6px 14px", fontSize: "12.5px" }}
                  onClick={() => setSensitivity(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Gaze Departure Threshold */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Distraction Gaze Timeout</span>
              <span className="ap-setting-sub">Maximum continuous duration driver may look away from the road before warning triggers</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["1.5s", "2.5s", "4.0s"].map((time) => (
                <button
                  key={time}
                  className={`ap-btn ${gazeThreshold === time ? "ap-btn-primary" : "ap-btn-secondary"}`}
                  style={{ padding: "6px 14px", fontSize: "12.5px" }}
                  onClick={() => setGazeThreshold(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Snapshot */}
          <div className="ap-setting-row">
            <div className="ap-setting-info">
              <span className="ap-setting-title">Auto-Capture Safety Evidence</span>
              <span className="ap-setting-sub">Automatically save optical video snapshot when a critical drowsiness or distraction alarm fires</span>
            </div>
            <button
              className={`ap-switch ${autoSnapshot ? "active" : ""}`}
              onClick={() => setAutoSnapshot(!autoSnapshot)}
              role="switch"
              aria-checked={autoSnapshot}
              aria-label="Toggle auto snapshot"
            >
              <span className="ap-switch-track" />
              <span className="ap-switch-thumb" />
            </button>
          </div>
        </div>

        {/* Card 3: System & Hardware Telemetry */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              Hardware &amp; Neural Core Architecture
            </h2>
            <span className="ap-tag ap-tag-safe">Nominal</span>
          </div>

          <div className="ap-table-wrap" style={{ border: "none" }}>
            <table className="ap-table">
              <tbody>
                <tr>
                  <td><strong>DriverGuard Platform Version</strong></td>
                  <td>v1.0.0 (Fleet Production Engine)</td>
                  <td><span className="ap-tag ap-tag-safe">UP TO DATE</span></td>
                </tr>
                <tr>
                  <td><strong>AI Vision Ensemble</strong></td>
                  <td>Dual Model: MobileNetV2 + ShuffleNetV2 ONNX</td>
                  <td><span className="ap-tag ap-tag-safe">ACTIVE</span></td>
                </tr>
                <tr>
                  <td><strong>Optical Input Stream</strong></td>
                  <td>DirectShow Single Camera • 640x480 @ 30 FPS</td>
                  <td><span className="ap-tag ap-tag-info">HARDWARE OK</span></td>
                </tr>
                <tr>
                  <td><strong>Inference Pipeline Latency</strong></td>
                  <td>Average: 18ms • Max: 32ms (Edge Accelerated)</td>
                  <td><span className="ap-tag ap-tag-safe">REAL-TIME</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
