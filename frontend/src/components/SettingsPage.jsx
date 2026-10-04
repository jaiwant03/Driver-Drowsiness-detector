import React from "react";

export function SettingsPage({ settings, setSettings }) {
  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVolumeChange = (e) => {
    setSettings((prev) => ({ ...prev, volume: parseFloat(e.target.value) }));
  };

  return (
    <div className="page-settings">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure monitoring preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="settings-sections">
        {/* Monitoring Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <h2>Monitoring</h2>
          </div>

          <div className="settings-items">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Voice Alerts</div>
                <div className="setting-description">Spoken warnings for critical events</div>
              </div>
              <button
                className={`toggle-switch ${settings.voiceEnabled ? "active" : ""}`}
                onClick={() => toggleSetting("voiceEnabled")}
                role="switch"
                aria-checked={settings.voiceEnabled}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Visual Alerts</div>
                <div className="setting-description">On-screen alert banners</div>
              </div>
              <button
                className={`toggle-switch ${settings.visualEnabled ? "active" : ""}`}
                onClick={() => toggleSetting("visualEnabled")}
                role="switch"
                aria-checked={settings.visualEnabled}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Critical Alerts</div>
                <div className="setting-description">Modal popup for critical safety events</div>
              </div>
              <button
                className={`toggle-switch ${settings.criticalEnabled ? "active" : ""}`}
                onClick={() => toggleSetting("criticalEnabled")}
                role="switch"
                aria-checked={settings.criticalEnabled}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="setting-item volume">
              <div className="setting-info">
                <div className="setting-label">Alert Volume</div>
                <div className="setting-description">Audio alert volume level</div>
              </div>
              <div className="volume-control">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                <span className="volume-value">{Math.round(settings.volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interface Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <h2>Interface</h2>
          </div>

          <div className="settings-items">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Theme</div>
                <div className="setting-description">White + Orange (Default)</div>
              </div>
              <div className="setting-badge">Default</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h2>About</h2>
          </div>

          <div className="settings-items">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">DriverGuard</div>
                <div className="setting-description">AI-Powered Driver Safety Monitoring</div>
              </div>
              <div className="setting-badge">v1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
