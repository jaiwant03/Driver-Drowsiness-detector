import React from "react";

export function AlertBanner({ safetyLevel, safetyMessage, dismissed, onDismiss }) {
  if (dismissed) return null;

  let bannerClass = "alert-safe";
  let statusIcon = "🟢";
  let stripBadge = "DRIVER SAFE";
  let text = safetyMessage || "Driver is alert and focused.";

  if (safetyLevel === "CRITICAL" || safetyLevel === "DROWSY") {
    bannerClass = "alert-danger";
    statusIcon = "🔴";
    stripBadge = "CRITICAL SAFETY ALERT";
  } else if (safetyLevel === "DISTRACTED") {
    bannerClass = "alert-warning";
    statusIcon = "🟠";
    stripBadge = "ATTENTION REQUIRED";
  } else if (safetyLevel === "NO_FACE") {
    bannerClass = "alert-warning";
    statusIcon = "⚪";
    stripBadge = "FACE NOT DETECTED";
  } else if (safetyLevel === "STANDBY") {
    bannerClass = "alert-safe";
    statusIcon = "⚪";
    stripBadge = "SYSTEM STANDBY";
    text = "Camera is in standby. Click Start Monitoring to begin.";
  }

  return (
    <div className="alert-bar-strip">
      <div className={`alert-banner ${bannerClass}`} id="alertBanner" role="alert" aria-live="assertive">
        <div className="alert-strip-content">
          <span className="alert-status-icon">{statusIcon}</span>
          <span className="alert-strip-badge">{stripBadge}</span>
          <span className="alert-strip-divider">—</span>
          <span className="alert-strip-text">{text}</span>
        </div>
        <button className="alert-banner-close" onClick={onDismiss} aria-label="Dismiss alert">
          ✕
        </button>
      </div>
    </div>
  );
}
