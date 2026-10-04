import React from "react";
import { useDriverMonitor } from "./hooks/useDriverMonitor";
import { Header } from "./components/Header";
import { AlertBanner } from "./components/AlertBanner";
import { LiveMonitor } from "./components/LiveMonitor";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { AlertsTab } from "./components/AlertsTab";
import { ReportTab } from "./components/ReportTab";
import { Modals } from "./components/Modals";
import { Footer } from "./components/Footer";

export default function App() {
  const {
    // Refs
    videoRef,
    canvasRef,

    // State
    monitoring,
    backendOnline,
    modelStats,
    fps,
    latencyMs,
    currentScore,
    scoreHistory,
    safetyLevel,
    safetyMessage,
    drowsinessData,
    distractionData,
    sessionSeconds,
    maxFrames,
    drowsyEvents,
    yawnEvents,
    distractEvents,
    counts,
    alertHistory,
    timelineEvents,
    snapshots,
    settings,
    activeTab,
    focusMode,
    bannerDismissed,
    isSettingsOpen,
    isGalleryOpen,
    isSessionCompleteOpen,
    isAlarmModalOpen,
    alarmDetails,

    // Actions
    setSettings,
    setActiveTab,
    setFocusMode,
    setBannerDismissed,
    setIsSettingsOpen,
    setIsGalleryOpen,
    setIsSessionCompleteOpen,
    setIsAlarmModalOpen,
    setSnapshots,
    setAlertHistory,
    startCamera,
    stopCamera,
    captureSnapshot,
    resetSession,
    exportCSV,
    exportPDF,
  } = useDriverMonitor();

  return (
    <div className={`app-root ${focusMode ? "focus-mode-active" : ""}`}>
      {/* 1. AUTOMOTIVE SAFETY CONSOLE HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        fps={fps}
        alertCount={alertHistory.length}
        voiceEnabled={settings.voiceEnabled}
        onToggleVoice={() =>
          setSettings((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
        }
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. DYNAMIC SAFETY ALERT BANNER */}
      {settings.visualEnabled && (
        <AlertBanner
          safetyLevel={safetyLevel}
          safetyMessage={safetyMessage}
          dismissed={bannerDismissed}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* 3. MAIN VIEWPORT (STRICT 100vh SINGLE SCREEN DESKTOP FIT) */}
      <main className="cc-viewport" id="dashboard">
        {activeTab === "live" && (
          <LiveMonitor
            videoRef={videoRef}
            canvasRef={canvasRef}
            monitoring={monitoring}
            safetyLevel={safetyLevel}
            latencyMs={latencyMs}
            currentScore={currentScore}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
            sessionSeconds={sessionSeconds}
            onStart={startCamera}
            onStop={stopCamera}
            onReset={resetSession}
            onSnapshot={captureSnapshot}
          />
        )}

        {activeTab === "analytics" && (
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
        )}

        {activeTab === "alerts" && (
          <AlertsTab
            alertHistory={alertHistory}
            onClear={() => setAlertHistory([])}
            onOpenGallery={() => setIsGalleryOpen(true)}
            snapshotCount={snapshots.length}
          />
        )}

        {activeTab === "report" && (
          <ReportTab
            sessionSeconds={sessionSeconds}
            maxFrames={maxFrames}
            currentScore={currentScore}
            drowsyEvents={drowsyEvents}
            yawnEvents={yawnEvents}
            distractEvents={distractEvents}
            onExportPDF={exportPDF}
            onExportCSV={exportCSV}
          />
        )}
      </main>

      {/* 4. COMPACT SYSTEM STATUS FOOTER */}
      <Footer
        backendOnline={backendOnline}
        monitoring={monitoring}
        latencyMs={latencyMs}
        modelStats={modelStats}
      />

      {/* 5. MODALS & OVERLAYS */}
      <Modals
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        isGalleryOpen={isGalleryOpen}
        onCloseGallery={() => setIsGalleryOpen(false)}
        snapshots={snapshots}
        onClearGallery={() => setSnapshots([])}
        isSessionCompleteOpen={isSessionCompleteOpen}
        onCloseSessionComplete={() => setIsSessionCompleteOpen(false)}
        sessionSeconds={sessionSeconds}
        maxFrames={maxFrames}
        currentScore={currentScore}
        drowsyEvents={drowsyEvents}
        yawnEvents={yawnEvents}
        distractEvents={distractEvents}
        onViewReport={() => {
          setIsSessionCompleteOpen(false);
          setActiveTab("report");
        }}
        onExportCSV={exportCSV}
        isAlarmModalOpen={isAlarmModalOpen}
        onCloseAlarm={() => setIsAlarmModalOpen(false)}
        alarmDetails={alarmDetails}
      />

      {/* Exit Focus Mode Floating Pill */}
      {focusMode && (
        <button
          className="btn-exit-focus"
          onClick={() => setFocusMode(false)}
          title="Exit Focus Mode"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Exit Focus Mode
        </button>
      )}
    </div>
  );
}
