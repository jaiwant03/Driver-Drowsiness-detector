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
