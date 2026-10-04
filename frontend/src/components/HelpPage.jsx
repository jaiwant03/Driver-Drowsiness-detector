import React from "react";

export function HelpPage() {
  return (
    <div className="page-help">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Help & Information</h1>
          <p className="page-subtitle">Learn how to use DriverGuard</p>
        </div>
      </div>

      {/* Help Sections */}
      <div className="help-sections">
        {/* Getting Started */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 16 16 12 12 8" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Getting Started</h2>
            <p>DriverGuard uses AI to monitor driver attentiveness in real-time. Navigate to <strong>Live Monitor</strong> and click <strong>Start Monitoring</strong> to begin analyzing driver behavior through your camera.</p>
          </div>
        </div>

        {/* Features */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Key Features</h2>
            <ul>
              <li><strong>Eyes Open/Closed Detection:</strong> Monitors eyelid state to detect drowsiness</li>
              <li><strong>Yawn Detection:</strong> Identifies signs of fatigue through yawning</li>
              <li><strong>Distraction Detection:</strong> Recognizes when the driver is not focused on the road</li>
              <li><strong>Safety Score:</strong> Real-time scoring based on driving attentiveness</li>
              <li><strong>Voice Alerts:</strong> Spoken warnings for critical safety events</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Navigation</h2>
            <ul>
              <li><strong>Dashboard:</strong> Overview of current status and key metrics</li>
              <li><strong>Live Monitor:</strong> Real-time camera feed with AI detection</li>
              <li><strong>Analytics:</strong> Charts and detailed session statistics</li>
              <li><strong>Alerts:</strong> History of all safety alerts and events</li>
              <li><strong>Session Reports:</strong> Export and review session summaries</li>
              <li><strong>History:</strong> View previous monitoring sessions</li>
            </ul>
          </div>
        </div>

        {/* Safety Levels */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Safety Levels</h2>
            <ul>
              <li><strong>Safe (Green):</strong> Driver is attentive and alert</li>
              <li><strong>Warning (Orange):</strong> Minor drowsiness or distraction detected</li>
              <li><strong>Critical (Red):</strong> Immediate attention required</li>
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Tips for Best Results</h2>
            <ul>
              <li>Ensure good lighting for optimal face detection</li>
              <li>Position the camera to capture your full face</li>
              <li>Allow camera permissions when prompted</li>
              <li>Take breaks during long driving sessions</li>
              <li>Adjust alert settings in the Settings page</li>
            </ul>
          </div>
        </div>

        {/* Technical Info */}
        <div className="help-section">
          <div className="help-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </div>
          <div className="help-section-content">
            <h2>Technical Information</h2>
            <p>DriverGuard uses advanced deep learning models for real-time driver behavior analysis:</p>
            <ul>
              <li><strong>Drowsiness Model:</strong> Detects eyes open/closed and yawning</li>
              <li><strong>Distraction Model:</strong> Identifies various driver distractions</li>
              <li><strong>Processing:</strong> Local inference with ~30 FPS capture rate</li>
              <li><strong>Privacy:</strong> All processing happens locally on your device</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
