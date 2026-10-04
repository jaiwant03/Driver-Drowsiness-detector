import React from "react";
import { ReportTab } from "./ReportTab";

export function ReportsPage({
  sessionSeconds,
  maxFrames,
  currentScore,
  drowsyEvents,
  yawnEvents,
  distractEvents,
  onExportPDF,
  onExportCSV,
}) {
  return (
    <div className="page-reports">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Session Reports</h1>
          <p className="page-subtitle">Export and review session data</p>
        </div>
        <div className="page-header-right">
          <button className="btn-export" onClick={onExportCSV}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button className="btn-export" onClick={onExportPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Reports Content */}
      <ReportTab
        sessionSeconds={sessionSeconds}
        maxFrames={maxFrames}
        currentScore={currentScore}
        drowsyEvents={drowsyEvents}
        yawnEvents={yawnEvents}
        distractEvents={distractEvents}
        onExportPDF={onExportPDF}
        onExportCSV={onExportCSV}
      />
    </div>
  );
}
