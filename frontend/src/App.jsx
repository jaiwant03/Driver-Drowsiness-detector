import React, { useState } from "react";
import { useDriverMonitor } from "./hooks/useDriverMonitor";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { LiveMonitorPage } from "./components/LiveMonitorPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { AlertsPage } from "./components/AlertsPage";
import { ReportsPage } from "./components/ReportsPage";
import { HistoryPage } from "./components/HistoryPage";
import { SettingsPage } from "./components/SettingsPage";
import { Modals } from "./components/Modals";
import { AlertBanner } from "./components/AlertBanner";

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

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            safetyLevel={safetyLevel}
            safetyMessage={safetyMessage}
            currentScore={currentScore}
            sessionSeconds={sessionSeconds}
            maxFrames={maxFrames}
            drowsyEvents={drowsyEvents}
            yawnEvents={yawnEvents}
            distractEvents={distractEvents}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
          />
        );
      case "live":
        return (
          <LiveMonitorPage
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
            backendOnline={backendOnline}
            fps={fps}
          />
        );
      case "analytics":
        return (
          <AnalyticsPage
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
        );
      case "alerts":
        return (
          <AlertsPage
            alertHistory={alertHistory}
            onClear={() => setAlertHistory([])}
            onOpenGallery={() => setIsGalleryOpen(true)}
            snapshotCount={snapshots.length}
          />
        );
      case "reports":
        return (
          <ReportsPage
            sessionSeconds={sessionSeconds}
            maxFrames={maxFrames}
            currentScore={currentScore}
            drowsyEvents={drowsyEvents}
            yawnEvents={yawnEvents}
            distractEvents={distractEvents}
            onExportPDF={exportPDF}
            onExportCSV={exportCSV}
          />
        );
      case "history":
        return <HistoryPage />;
      case "settings":
        return <SettingsPage settings={settings} setSettings={setSettings} />;
      case "help":
        return <HelpPage />;
      default:
        return (
          <DashboardPage
            safetyLevel={safetyLevel}
            safetyMessage={safetyMessage}
            currentScore={currentScore}
            sessionSeconds={sessionSeconds}
            maxFrames={maxFrames}
            drowsyEvents={drowsyEvents}
            yawnEvents={yawnEvents}
            distractEvents={distractEvents}
            drowsinessData={drowsinessData}
            distractionData={distractionData}
          />
        );
    }
  };

  return (
    <div className={`app-root-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${focusMode ? "focus-mode-active" : ""}`}>
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        alertCount={alertHistory.length}
        backendOnline={backendOnline}
        cameraConnected={monitoring}
        modelsActive={backendOnline}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Safety Alert Banner */}
        {settings.visualEnabled && !bannerDismissed && safetyLevel !== "STANDBY" && (
          <AlertBanner
            safetyLevel={safetyLevel}
            safetyMessage={safetyMessage}
            dismissed={bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Page Content */}
        <div className="page-content">
          {renderPage()}
        </div>
      </div>

      {/* Modals */}
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
          setCurrentPage("reports");
        }}
        onExportCSV={exportCSV}
        isAlarmModalOpen={isAlarmModalOpen}
        onCloseAlarm={() => setIsAlarmModalOpen(false)}
        alarmDetails={alarmDetails}
      />

      {/* Exit Focus Mode Floating Button */}
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
