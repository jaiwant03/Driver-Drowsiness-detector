import React from "react";

export function Footer({ backendOnline, monitoring, latencyMs, modelStats }) {
  return (
    <footer className="cc-footer" role="contentinfo">
      <div className="cc-footer-left">
        <span className="status-indicator-tag">
          <span className={`dot-${backendOnline ? "live" : "off"}`}></span>
          {backendOnline ? "Backend Online" : "Backend Offline"}
        </span>
        <span className="status-indicator-tag" id="footCamStatus">
          <span className={`dot-${monitoring ? "live" : "off"}`}></span>
          {monitoring ? "Camera Active" : "Camera Standby"}
        </span>
        <span className="status-indicator-tag">
          <span className="dot-live"></span> MobileNetV2 Active
        </span>
        <span className="status-indicator-tag">
          <span className="dot-live"></span> ResNet-18 Active
        </span>
      </div>

      <div className="cc-footer-right">
        <span>
          Latency: <strong id="inferenceTime">{latencyMs !== null ? `${latencyMs} ms` : "— ms"}</strong>
        </span>
        <span className="sep">•</span>
        <span>
          Classes:{" "}
          <strong id="statModels">
            {modelStats ? `${modelStats.drowsiness} + ${modelStats.distraction}` : "4 + 10"}
          </strong>
        </span>
      </div>
    </footer>
  );
}
