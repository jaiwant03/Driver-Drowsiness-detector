import React from "react";
import { CameraView } from "./CameraView";
import { SafetyScoreCard } from "./SafetyScoreCard";
import { DrowsinessCard } from "./DrowsinessCard";
import { DistractionCard } from "./DistractionCard";

export function LiveMonitor({
  videoRef,
  canvasRef,
  monitoring,
  safetyLevel,
  latencyMs,
  currentScore,
  drowsinessData,
  distractionData,
  sessionSeconds,
  onStart,
  onStop,
  onReset,
  onSnapshot,
}) {
  return (
    <div className="tab-page active" id="tabLive">
      <div className="live-console-grid">
        {/* Left Column (~60% width): Large Live Camera Feed & Viewfinder */}
        <section className="camera-col">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            monitoring={monitoring}
            safetyLevel={safetyLevel}
            latencyMs={latencyMs}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
            sessionSeconds={sessionSeconds}
            onStart={onStart}
            onStop={onStop}
            onReset={onReset}
            onSnapshot={onSnapshot}
          />
        </section>

        {/* Right Column (~40% width): Unified Vertical Telemetry Stack */}
        <section className="telemetry-col">
          <SafetyScoreCard
            score={currentScore}
            safetyLevel={safetyLevel}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
          />
          <DrowsinessCard data={drowsinessData} />
          <DistractionCard data={distractionData} />
        </section>
      </div>
    </div>
  );
}
