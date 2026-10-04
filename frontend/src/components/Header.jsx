import React from "react";

export function Header({
  activeTab,
  setActiveTab,
  backendOnline,
  fps,
  alertCount,
  voiceEnabled,
  onToggleVoice,
  focusMode,
  onToggleFocus,
  onOpenSettings,
}) {
  return (
    <header className="cc-header" role="banner">
      <div className="cc-header-container">
        {/* Brand & Identity */}
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <h1>DriverGuard</h1>
              <span className="badge-tag">AI Safety</span>
            </div>
            <p className="brand-sub">Real-Time AI Driver Safety System</p>
          </div>
        </div>

        {/* Central Horizontal Navigation Tabs */}
        <nav className="cc-nav-tabs" role="tablist" aria-label="Dashboard Views">
          <button
            className={`nav-tab ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
            role="tab"
            aria-selected={activeTab === "live"}
            id="tabLiveBtn"
          >
            <span className="tab-dot"></span> LIVE MONITOR
          </button>
          <button
            className={`nav-tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
            role="tab"
            aria-selected={activeTab === "analytics"}
            id="tabAnalyticsBtn"
          >
            ANALYTICS
          </button>
          <button
            className={`nav-tab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
            role="tab"
            aria-selected={activeTab === "alerts"}
            id="tabAlertsBtn"
          >
            ALERTS <span className="tab-badge" id="alertTabCount">{alertCount}</span>
          </button>
          <button
            className={`nav-tab ${activeTab === "report" ? "active" : ""}`}
            onClick={() => setActiveTab("report")}
            role="tab"
            aria-selected={activeTab === "report"}
            id="tabReportBtn"
          >
            REPORT
          </button>
        </nav>

        {/* Quick Control & Telemetry Bar */}
        <div className="cc-header-right">
          {/* Backend Status */}
          <div className="backend-status" id="backendStatus" aria-live="polite">
            <span className={`status-dot ${backendOnline ? "online" : "offline"}`} id="statusDot"></span>
            <span id="statusText">{backendOnline ? "Online" : "Offline"}</span>
          </div>

          {/* FPS Telemetry Badge */}
          <div className="fps-badge" id="fpsBadge" aria-label="Frames per second">
            <span id="fpsValue">{fps ? `${fps} fps` : "— fps"}</span>
          </div>

          {/* Voice Alert Toggle */}
          <button
            className={`header-action-btn ${voiceEnabled ? "active" : ""}`}
            onClick={onToggleVoice}
            id="btnVoiceToggle"
            title="Toggle Voice Alerts"
          >
            <svg
              id="voiceIcon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span id="voiceText">Voice: {voiceEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Focus Mode Toggle */}
          <button
            className={`header-action-btn ${focusMode ? "active" : ""}`}
            onClick={onToggleFocus}
            id="btnFocusMode"
            title="Focus Mode (Distraction-Free)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Focus
          </button>

          {/* Settings Modal Trigger */}
          <button
            className="header-icon-btn"
            onClick={onOpenSettings}
            id="btnOpenSettings"
            title="Settings"
            aria-label="Settings"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
