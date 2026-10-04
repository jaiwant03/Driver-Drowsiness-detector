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
