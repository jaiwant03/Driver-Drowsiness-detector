import React from "react";
import { AnalyticsTab } from "./AnalyticsTab";

export function AnalyticsPage({
  maxFrames,
  drowsyEvents,
  yawnEvents,
  distractEvents,
  currentScore,
  scoreHistory,
  counts,
  timelineEvents,
  drowsinessData,
  distractionData,
}) {
  return (
    <div className="page-analytics">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Session statistics and trends</p>
        </div>
      </div>

      {/* Analytics Content */}
      <AnalyticsTab
        maxFrames={maxFrames}
        drowsyEvents={drowsyEvents}
        yawnEvents={yawnEvents}
        distractEvents={distractEvents}
        currentScore={currentScore}
        scoreHistory={scoreHistory}
        counts={counts}
        timelineEvents={timelineEvents}
        drowsinessData={drowsinessData}
        distractionData={distractionData}
      />
    </div>
  );
}
