import React, { useState, useEffect } from "react";
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Tab switch handler: activates selected tab and resets view to top
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Scroll listener for progress bar and back-to-top button on scrollable tabs
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress((scrollY / docHeight) * 100);
      } else {
        setScrollProgress(0);
      }
      setShowScrollTop(scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`app-root ${focusMode ? "focus-mode-active" : ""}`}>
      {/* Scroll Progress Indicator Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* 1. STICKY AUTOMOTIVE SAFETY CONSOLE HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabClick}
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

      {/* 3. DEDICATED TAB-BASED SCREENS (PRESERVES CAMERA STREAM & AI INFERENCE) */}
      <main className="cc-viewport" id="dashboard">
        {/* Screen 1: Live Monitor & Driver Telemetry */}
        <div
          id="live-tab-screen"
          className={`tab-screen-panel ${activeTab === "live" ? "active-screen" : "hidden-screen"}`}
          role="tabpanel"
          aria-hidden={activeTab !== "live"}
        >
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
        </div>

        {/* Screen 2: Real-Time Analytics, Donut & Trend Charts */}
        <div
          id="analytics-tab-screen"
          className={`tab-screen-panel ${activeTab === "analytics" ? "active-screen" : "hidden-screen"}`}
          role="tabpanel"
          aria-hidden={activeTab !== "analytics"}
        >
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

        {/* Screen 3: Alert History & Event Log */}
        <div
          id="alerts-tab-screen"
          className={`tab-screen-panel ${activeTab === "alerts" ? "active-screen" : "hidden-screen"}`}
          role="tabpanel"
          aria-hidden={activeTab !== "alerts"}
        >
          <AlertsTab
            alertHistory={alertHistory}
            onClear={() => setAlertHistory([])}
            onOpenGallery={() => setIsGalleryOpen(true)}
            snapshotCount={snapshots.length}
          />
        </div>

        {/* Screen 4: Fleet Safety Audit Report */}
        <div
          id="report-tab-screen"
          className={`tab-screen-panel ${activeTab === "report" ? "active-screen" : "hidden-screen"}`}
          role="tabpanel"
          aria-hidden={activeTab !== "report"}
        >
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
        </div>
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
          handleTabClick("report");
        }}
        onExportCSV={exportCSV}
        isAlarmModalOpen={isAlarmModalOpen}
        onCloseAlarm={() => setIsAlarmModalOpen(false)}
        alarmDetails={alarmDetails}
      />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          className="btn-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}

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
