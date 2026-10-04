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

  // Smooth scroll to section when tab clicked
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    const targetEl = document.getElementById(`${tabKey}-section`);
    if (targetEl) {
      const headerOffset = 74;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Scroll spy to update active tab and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress((scrollY / docHeight) * 100);
      }
      setShowScrollTop(scrollY > 350);

      // Section spy
      const sections = ["live", "analytics", "alerts", "report"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`${sections[i]}-section`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveTab(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setActiveTab]);

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

      {/* 3. VERTICAL SCROLLING DASHBOARD MAIN CONTAINER */}
      <main className="cc-viewport" id="dashboard">
        {/* Section 1: Live Monitor & Driver Telemetry */}
        <section id="live-section" className="dashboard-section">
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
        </section>

        {/* Section 2: Real-Time Analytics, Donut & Trend Charts */}
        <section id="analytics-section" className="dashboard-section">
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
        </section>

        {/* Section 3: Alert History & Event Log */}
        <section id="alerts-section" className="dashboard-section">
          <AlertsTab
            alertHistory={alertHistory}
            onClear={() => setAlertHistory([])}
            onOpenGallery={() => setIsGalleryOpen(true)}
            snapshotCount={snapshots.length}
          />
        </section>

        {/* Section 4: Fleet Safety Audit Report */}
        <section id="report-section" className="dashboard-section">
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
        </section>
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
