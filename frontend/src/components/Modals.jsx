import React from "react";

export function Modals({
  // Settings
  isSettingsOpen,
  onCloseSettings,
  settings,
  setSettings,

  // Gallery
  isGalleryOpen,
  onCloseGallery,
  snapshots,
  onClearGallery,

  // Session Complete
  isSessionCompleteOpen,
  onCloseSessionComplete,
  sessionSeconds,
  maxFrames,
  currentScore,
  drowsyEvents,
  yawnEvents,
  distractEvents,
  onViewReport,
  onExportCSV,

  // Emergent Alarm
  isAlarmModalOpen,
  onCloseAlarm,
  alarmDetails,
}) {
  // Format timer
  const hrs = String(Math.floor(sessionSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sessionSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(sessionSeconds % 60).padStart(2, "0");
  const timerStr = `${hrs}:${mins}:${secs}`;

  return (
    <>
      {/* ── (A) SETTINGS MODAL ── */}
      {isSettingsOpen && (
        <div
          className="cc-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && onCloseSettings()}
        >
          <div className="cc-modal-card">
            <div className="modal-hdr">
              <h3>DriverGuard System &amp; Alert Settings</h3>
              <button
                className="modal-close-btn"
                onClick={onCloseSettings}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="setting-toggle-row">
                <div>
                  <strong>Voice Alert Synthesis</strong>
                  <p>Spoken audio cues on detected fatigue, eyes closed, or distraction.</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.voiceEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, voiceEnabled: e.target.checked }))
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-toggle-row">
                <div>
                  <strong>Visual Alert Banners</strong>
                  <p>Display high-contrast warning banner strip during attention drops.</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.visualEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, visualEnabled: e.target.checked }))
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-toggle-row">
                <div>
                  <strong>Emergent Critical Modal Pop-up</strong>
                  <p>Display full-screen alert backdrop on severe critical emergencies.</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.criticalEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, criticalEnabled: e.target.checked }))
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-slider-row">
                <div className="slider-hdr">
                  <strong>Alert Audio Volume</strong>
                  <span>{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(settings.volume * 100)}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      volume: Number(e.target.value) / 100,
                    }))
                  }
                  className="cc-range"
                />
              </div>
            </div>
            <div className="modal-ftr">
              <button className="btn btn-primary btn-ctrl" onClick={onCloseSettings}>
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── (B) SNAPSHOT GALLERY MODAL ── */}
      {isGalleryOpen && (
        <div
          className="cc-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && onCloseGallery()}
        >
          <div className="cc-modal-card modal-wide">
            <div className="modal-hdr">
              <h3>Captured Event Snapshots ({snapshots.length})</h3>
              <button className="modal-close-btn" onClick={onCloseGallery} aria-label="Close gallery">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="gallery-grid">
                {snapshots.length > 0 ? (
                  snapshots.map((snap) => (
                    <div key={snap.id} className="gallery-card">
                      <img src={snap.src} className="gallery-img" alt="Captured Frame" />
                      <div className="gallery-info">
                        <span>{snap.time}</span>
                        <strong>Score: {snap.score}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-empty">
                    No snapshots captured yet. Click &quot;SNAPSHOT&quot; on the live camera to save a
                    frame.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-ftr">
              <button
                className="btn btn-secondary btn-ctrl"
                onClick={onClearGallery}
                disabled={snapshots.length === 0}
              >
                Clear Gallery
              </button>
              <button className="btn btn-primary btn-ctrl" onClick={onCloseGallery}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── (C) SESSION COMPLETE SUMMARY MODAL ── */}
      {isSessionCompleteOpen && (
        <div
          className="cc-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && onCloseSessionComplete()}
        >
          <div className="cc-modal-card">
            <div className="modal-hdr">
              <h3>Monitoring Session Completed</h3>
              <button
                className="modal-close-btn"
                onClick={onCloseSessionComplete}
                aria-label="Close summary"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="complete-score-row">
                <div
                  className="score-circle-sm"
                  style={{
                    backgroundColor:
                      currentScore < 50 ? "#DC2626" : currentScore < 75 ? "#F59E0B" : "#16A34A",
                  }}
                >
                  {currentScore}
                </div>
                <div>
                  <h4>Driver Safety Score: {currentScore} / 100</h4>
                  <p>Session completed. Fleet telemetry summarized below.</p>
                </div>
              </div>
              <div className="complete-stats-list">
                <div className="complete-stat-item">
                  <span>Total Duration</span>
                  <strong>{timerStr}</strong>
                </div>
                <div className="complete-stat-item">
                  <span>Frames Analysed</span>
                  <strong>{maxFrames.toLocaleString()}</strong>
                </div>
                <div className="complete-stat-item">
                  <span>Drowsy Events</span>
                  <strong>{drowsyEvents}</strong>
                </div>
                <div className="complete-stat-item">
                  <span>Yawn Events</span>
                  <strong>{yawnEvents}</strong>
                </div>
                <div className="complete-stat-item">
                  <span>Distractions</span>
                  <strong>{distractEvents}</strong>
                </div>
              </div>
            </div>
            <div className="modal-ftr">
              <button className="btn btn-secondary btn-ctrl" onClick={onExportCSV}>
                Export CSV
              </button>
              <button className="btn btn-primary btn-ctrl" onClick={onViewReport}>
                Open Full Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── (D) EMERGENT ALARM MODAL ── */}
      {isAlarmModalOpen && (
        <div
          className="alarm-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && onCloseAlarm()}
        >
          <div className="alarm-modal">
            <div className="alarm-pulse" aria-hidden="true">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2>{alarmDetails.title || "SAFETY ALERT DETECTED"}</h2>
            <p>
              {alarmDetails.message ||
                "Driver attention warning detected. Please stay attentive on the road."}
            </p>
            <button className="btn btn-alarm-dismiss" onClick={onCloseAlarm}>
              Dismiss Alert
            </button>
          </div>
        </div>
      )}
    </>
  );
}
