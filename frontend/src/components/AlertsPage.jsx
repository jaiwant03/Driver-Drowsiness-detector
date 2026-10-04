import React from "react";
import { AlertsTab } from "./AlertsTab";

export function AlertsPage({
  alertHistory,
  onClear,
  onOpenGallery,
  snapshotCount,
}) {
  return (
    <div className="page-alerts">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">Safety alert history</p>
        </div>
        <div className="page-header-right">
          {alertHistory.length > 0 && (
            <button className="btn-clear-alerts" onClick={onClear}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Alerts Content */}
      <AlertsTab
        alertHistory={alertHistory}
        onClear={onClear}
        onOpenGallery={onOpenGallery}
        snapshotCount={snapshotCount}
      />
    </div>
  );
}
