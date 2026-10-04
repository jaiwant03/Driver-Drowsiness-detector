"use strict";

/**
 * DriverGuard — Dual-Model Driver Safety Command Center
 * =====================================================
 * Single camera → two independent deep-learning models:
 *   1. Drowsiness  (MobileNetV2 / Keras)
 *   2. Distraction (ResNet-18  / PyTorch)
 *
 * Command-Center Telemetry Features:
 *   - Driver Safety Score (0-100 ring gauge)
 *   - Current Status indicators (Eyes, Yawn, Distraction)
 *   - Session Timer (HH:MM:SS)
 *   - Horizontal Live Detection Timeline
 *   - Detection Distribution Donut & Trend Sparkline
 *   - Recent Alert History & Event Log
 *   - Voice Alerts (Web Speech API with cooldown)
 *   - Focus Mode & Fullscreen Camera
 *   - Event Snapshot Capture & Gallery
 *   - Session Report Modal, CSV Export, and PDF Print
 */

/* =========================================================
   CONFIGURATION
========================================================= */
const DEFAULT_API_URL = (() => {
  const origin = typeof window !== "undefined" && window.location && window.location.origin
    ? window.location.origin
    : "http://127.0.0.1:5000";
  return origin !== "null" ? origin : "http://127.0.0.1:5000";
})();

const CONFIG = {
  apiUrl:            window.__APP_API_URL__ || DEFAULT_API_URL,
  captureIntervalMs: 1000 / 30,
  captureQuality:    0.75,
  captureWidthPx:    640,
  healthPollMs:      4000,
  voiceCooldownMs:   8000,
};

/* =========================================================
   DOM REFERENCES
========================================================= */
const $ = id => document.getElementById(id);

const el = {
  /* Header & Telemetry */
  statusDot:         $("statusDot"),
  statusText:        $("statusText"),
  fpsBadge:          $("fpsBadge"),
  fpsValue:          $("fpsValue"),
  btnVoiceToggle:    $("btnVoiceToggle"),
  voiceText:         $("voiceText"),
  btnFocusMode:      $("btnFocusMode"),
  btnExitFocus:      $("btnExitFocus"),
  btnOpenSettings:   $("btnOpenSettings"),

  /* Alert Banner */
  alertBanner:       $("alertBanner"),
  alertBannerText:   $("alertBannerText"),
  alertBannerClose:  $("alertBannerClose"),
  alertStripBadge:   $("alertStripBadge"),

  /* Camera Card */
  cameraFeed:        $("cameraFeed"),
  captureCanvas:     $("captureCanvas"),
  videoWrap:         $("videoWrap"),
  videoStatus:       $("videoStatus"),
  videoStatusText:   $("videoStatusText"),
  cameraPlaceholder: $("cameraPlaceholder"),
  safetyBadge:       $("safetyBadge"),
  inferenceTime:     $("inferenceTime"),
  camFaceTag:        $("camFaceTag"),
  camLatencyTag:     $("camLatencyTag"),
  footCamStatus:     $("footCamStatus"),

  /* Action Buttons */
  btnStart:          $("btnStart"),
  btnStop:           $("btnStop"),
  btnReset:          $("btnReset"),
  btnFullscreen:     $("btnFullscreen"),
  btnCaptureSnapshot:$("btnCaptureSnapshot"),
  sessionTimer:      $("sessionTimer"),

  /* Driver Safety Score */
  scoreRingFill:     $("scoreRingFill"),
  scoreValue:        $("scoreValue"),
  scoreLabel:        $("scoreLabel"),
  statusEyesText:    $("statusEyesText"),
  statusYawnText:    $("statusYawnText"),
  statusDistractText:$("statusDistractText"),
  pillEyes:          $("pillEyes"),
  pillYawn:          $("pillYawn"),
  pillDistract:      $("pillDistract"),

  /* Drowsiness Panel */
  drowsinessPanel:   $("drowsinessPanel"),
  drowsinessBadge:   $("drowsinessBadge"),
  drowsinessIcon:    $("drowsinessIcon"),
  drowsinessLabel:   $("drowsinessLabel"),
  drowsinessRaw:     $("drowsinessRaw"),
  drowsinessConf:    $("drowsinessConf"),
  drowsinessBar:     $("drowsinessBar"),
  pClosed:           $("pClosed"),   bClosed:  $("bClosed"),
  pOpen:             $("pOpen"),     bOpen:    $("bOpen"),
  pNoYawn:           $("pNoYawn"),   bNoYawn:  $("bNoYawn"),
  pYawn:             $("pYawn"),     bYawn:    $("bYawn"),
  drowsyDuration:    $("drowsyDuration"),
  drowsyFrames:      $("drowsyFrames"),
  faceDetected:      $("faceDetected"),

  /* Distraction Panel */
  distractionPanel:  $("distractionPanel"),
  distractionBadge:  $("distractionBadge"),
  distractionIcon:   $("distractionIcon"),
  distractionLabel:  $("distractionLabel"),
  distractionRaw:    $("distractionRaw"),
  distractionConf:   $("distractionConf"),
  distractionBar:    $("distractionBar"),
  top3Name0:         $("top3Name0"), top3Conf0: $("top3Conf0"), top3_0: $("top3_0"),
  top3Name1:         $("top3Name1"), top3Conf1: $("top3Conf1"), top3_1: $("top3_1"),
  top3Name2:         $("top3Name2"), top3Conf2: $("top3Conf2"), top3_2: $("top3_2"),
  distractDuration:  $("distractDuration"),
  distractFrames:    $("distractFrames"),

  /* Session Overview & Stats */
  statFrames:        $("statFrames"),
  statDrowsyEvents:  $("statDrowsyEvents"),
  statYawnEvents:    $("statYawnEvents"),
  statDistractEvents:$("statDistractEvents"),
  statAvgConfidence: $("statAvgConfidence"),
  statSafety:        $("statSafety"),
  statModels:        $("statModels"),
  safetyIndicatorDot:$("safetyIndicatorDot"),

  /* Donut & Trend Charts */
  donutEyesOpen:     $("donutEyesOpen"),
  donutEyesClosed:   $("donutEyesClosed"),
  donutYawn:         $("donutYawn"),
  donutDistract:     $("donutDistract"),
  cntEyesOpen:       $("cntEyesOpen"),
  cntEyesClosed:     $("cntEyesClosed"),
  cntYawns:          $("cntYawns"),
  cntDistractions:   $("cntDistractions"),
  trendLine:         $("trendLine"),
  trendArea:         $("trendArea"),
  trendCurrentScoreTag: $("trendCurrentScoreTag"),

  /* Horizontal Timeline Rail */
  timelineRail:      $("timelineRail"),

  /* Alert History */
  alertHistoryList:  $("alertHistoryList"),
  historyEmptyState: $("historyEmptyState"),
  btnViewAllAlerts:  $("btnViewAllAlerts"),
  alertTabCount:     $("alertTabCount"),
  fullAlertsTbody:   $("fullAlertsTbody"),
  btnClearAlertHistory: $("btnClearAlertHistory"),

  /* Alarm Modal */
  alarmBackdrop:     $("alarmBackdrop"),
  alarmTitle:        $("alarmTitle"),
  alarmBody:         $("alarmBody"),
  btnDismissAlarm:   $("btnDismissAlarm"),

  /* Settings Modal */
  settingsModal:     $("settingsModal"),
  btnCloseSettings:  $("btnCloseSettings"),
  btnSaveSettings:   $("btnSaveSettings"),
  setVoiceToggle:    $("setVoiceToggle"),
  setVisualToggle:   $("setVisualToggle"),
  setCriticalToggle: $("setCriticalToggle"),
  setVolumeSlider:   $("setVolumeSlider"),
  setVolumeVal:      $("setVolumeVal"),

  /* Gallery Modal */
  galleryModal:      $("galleryModal"),
  galleryGrid:       $("galleryGrid"),
  galleryCount:      $("galleryCount"),
  btnCloseGallery:   $("btnCloseGallery"),
  btnCloseGalleryBtn:$("btnCloseGalleryBtn"),
  btnClearGallery:   $("btnClearGallery"),

  /* Session Complete Modal & Report */
  sessionCompleteModal: $("sessionCompleteModal"),
  btnCloseSessionModal: $("btnCloseSessionModal"),
  completeScoreCircle:  $("completeScoreCircle"),
  completeScoreHeading: $("completeScoreHeading"),
  compTime:             $("compTime"),
  compFrames:           $("compFrames"),
  compDrowsy:           $("compDrowsy"),
  compYawns:            $("compYawns"),
  compDistract:         $("compDistract"),
  btnModalExportCSV:    $("btnModalExportCSV"),
  btnModalViewReport:   $("btnModalViewReport"),
  btnExportCSV:         $("btnExportCSV"),
  btnExportPDF:         $("btnExportPDF"),
  reportDate:           $("reportDate"),
  repTime:              $("repTime"),
  repFrames:            $("repFrames"),
  repScore:             $("repScore"),
  repDrowsy:            $("repDrowsy"),
  repYawns:             $("repYawns"),
  repDistract:          $("repDistract"),
};

/* =========================================================
   APPLICATION STATE
========================================================= */
let state = {
  monitoring:      false,
  stream:          null,
  captureTimer:    null,
  healthTimer:     null,
  sessionClockTimer: null,
  sessionSeconds:  0,
  processingFrame: false,
  backendOnline:   false,
  alarmShown:      false,

  /* Safety Scoring */
  currentScore:    100,
  scoreHistory:    [100, 100, 100, 100, 100],

  /* FPS tracking */
  frameCount:      0,
  fpsLastTs:       performance.now(),
  currentFps:      0,

  /* Cumulative Metrics */
  maxFrames:          0,
  maxDrowsyEvents:    0,
  maxYawnEvents:      0,
  maxDistractEvents:  0,
  confidenceSum:      0,
  confidenceCount:    0,

  /* Category Counts for Donut Chart */
  counts: {
    eyesOpen:     0,
    eyesClosed:   0,
    yawns:        0,
    distractions: 0,
  },

  /* Alert Log & History */
  alertHistory:    [],
  timelineEvents:  [],
  snapshots:       [],

  /* Voice Synthesizer */
  lastVoiceTs:     0,
  settings: {
    voiceEnabled:    true,
    visualEnabled:   true,
    criticalEnabled: true,
    volume:          0.8,
  },
};

/* =========================================================
   INITIALISATION
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  resetUI();
  attachEventListeners();
  startHealthPoller();
  checkBackend();
  initSettings();
});

/* =========================================================
   EVENT LISTENERS
========================================================= */
function attachEventListeners() {
  /* Camera Controls */
  el.btnStart.addEventListener("click", startCamera);
  const btnPlaceholderStart = $("btnPlaceholderStart");
  if (btnPlaceholderStart) btnPlaceholderStart.addEventListener("click", startCamera);
  el.btnStop.addEventListener("click", stopCamera);
  el.btnReset.addEventListener("click", resetSession);
  el.btnFullscreen.addEventListener("click", toggleFullscreen);
  el.btnCaptureSnapshot.addEventListener("click", captureSnapshot);

  /* Tab Navigation */
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  /* Focus Mode */
  el.btnFocusMode.addEventListener("click", enterFocusMode);
  el.btnExitFocus.addEventListener("click", exitFocusMode);

  /* Voice Alert Header Toggle */
  el.btnVoiceToggle.addEventListener("click", toggleVoiceAlert);

  /* Modals */
  el.btnOpenSettings.addEventListener("click", openSettings);
  el.btnCloseSettings.addEventListener("click", closeSettings);
  el.btnSaveSettings.addEventListener("click", closeSettings);

  el.btnViewAllAlerts?.addEventListener("click", () => switchTab("alerts"));
  el.btnClearAlertHistory.addEventListener("click", clearAlertHistory);

  el.btnDismissAlarm.addEventListener("click", hideAlarm);
  el.alertBannerClose.addEventListener("click", hideBanner);

  el.btnCloseGallery.addEventListener("click", () => el.galleryModal.hidden = true);
  el.btnCloseGalleryBtn.addEventListener("click", () => el.galleryModal.hidden = true);
  el.btnClearGallery.addEventListener("click", clearGallery);

  el.btnCloseSessionModal.addEventListener("click", () => el.sessionCompleteModal.hidden = true);
  el.btnModalViewReport.addEventListener("click", () => {
    el.sessionCompleteModal.hidden = true;
    switchTab("report");
  });

  /* Exports */
  el.btnExportCSV.addEventListener("click", exportSessionCSV);
  el.btnModalExportCSV.addEventListener("click", exportSessionCSV);
  el.btnExportPDF.addEventListener("click", exportSessionPDF);

  /* Modal Backdrop dismissal */
  [el.settingsModal, el.galleryModal, el.sessionCompleteModal, el.alarmBackdrop].forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.hidden = true;
    });
  });

  window.addEventListener("beforeunload", stopCamera);
}

/* =========================================================
   TAB NAVIGATION SYSTEM
========================================================= */
function switchTab(tabName) {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    const isTarget = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isTarget);
    tab.setAttribute("aria-selected", isTarget ? "true" : "false");
  });

  document.querySelectorAll(".tab-page").forEach(page => {
    const pageId = "tab" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    page.classList.toggle("active", page.id === pageId);
  });

  if (tabName === "report") updateReportDocument();
  if (tabName === "analytics") updateAnalyticsTab();
}

/* =========================================================
   BACKEND HEALTH CHECK
========================================================= */
function startHealthPoller() {
  state.healthTimer = setInterval(checkBackend, CONFIG.healthPollMs);
}

async function checkBackend() {
  try {
    const res  = await fetch(`${CONFIG.apiUrl}/api/health`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setBackendOnline(true);

    if (data.models) {
      const nd = data.models.drowsiness?.num_classes ?? 4;
      const ni = data.models.distraction?.num_classes ?? 10;
      el.statModels.textContent = `${nd} + ${ni}`;
    }
  } catch {
    setBackendOnline(false);
  }
}

function setBackendOnline(online) {
  state.backendOnline = online;
  el.statusDot.className  = `status-dot ${online ? "online" : "offline"}`;
  el.statusText.textContent = online ? "Backend Online" : "Backend Offline";
}

/* =========================================================
   CAMERA — START / STOP / CAPTURE LOOP
========================================================= */
async function startCamera() {
  if (state.monitoring) return;

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width:      { ideal: 1280 },
        height:     { ideal: 720 },
        frameRate:  { ideal: 30, max: 30 },
        facingMode: "user",
      },
      audio: false,
    });

    el.cameraFeed.srcObject = state.stream;
    await el.cameraFeed.play();

    state.monitoring = true;
    el.cameraPlaceholder.classList.add("hidden");
    el.videoWrap.classList.add("active");
    el.btnStart.disabled = true;
    el.btnStop.disabled  = false;
    el.footCamStatus.innerHTML = `<span class="dot-live"></span> Camera Active`;

    setSafetyBadge("MONITORING", "badge-muted");
    setVideoStatus("MONITORING", "");
    startSessionTimer();
    startCaptureLoop();

    addTimelineEvent("MONITORING ACTIVE", "chip-safe");
    console.log("[DriverGuard] Camera started.");

  } catch (err) {
    console.error("[DriverGuard] Camera access error:", err);
    alert("Camera access denied or unavailable:\n" + err.message);
  }
}

function stopCamera() {
  if (!state.monitoring && !state.stream) return;

  state.monitoring = false;
  stopCaptureLoop();
  stopSessionTimer();

  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }

  el.cameraFeed.srcObject = null;
  el.cameraPlaceholder.classList.remove("hidden");
  el.videoWrap.className = "video-wrap";
  el.btnStart.disabled = false;
  el.btnStop.disabled  = true;
  el.footCamStatus.innerHTML = `<span class="dot-off"></span> Camera Standby`;

  setSafetyBadge("STOPPED", "badge-muted");
  setVideoStatus("STOPPED", "");

  addTimelineEvent("SESSION PAUSED", "chip-warn");
  openSessionCompleteModal();
}

function startCaptureLoop() {
  stopCaptureLoop();
  state.captureTimer = setInterval(captureAndSend, CONFIG.captureIntervalMs);
}

function stopCaptureLoop() {
  if (state.captureTimer !== null) {
    clearInterval(state.captureTimer);
    state.captureTimer = null;
  }
}

async function captureAndSend() {
  if (!state.monitoring || state.processingFrame) return;
  if (!el.cameraFeed.videoWidth || !el.cameraFeed.videoHeight) return;

  state.processingFrame = true;

  try {
    const ctx    = el.captureCanvas.getContext("2d");
    const aspect = el.cameraFeed.videoHeight / el.cameraFeed.videoWidth;
    const w      = CONFIG.captureWidthPx;
    const h      = Math.round(w * aspect);

    el.captureCanvas.width  = w;
    el.captureCanvas.height = h;
    ctx.drawImage(el.cameraFeed, 0, 0, w, h);

    const blob = await new Promise(res =>
      el.captureCanvas.toBlob(res, "image/jpeg", CONFIG.captureQuality)
    );
    if (!blob) return;

    const form = new FormData();
    form.append("frame", blob, "frame.jpg");

    const res = await fetch(`${CONFIG.apiUrl}/api/predict`, {
      method: "POST",
      body:   form,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Inference failed");

    setBackendOnline(true);
    updateUI(data);
    trackFps();

  } catch (err) {
    console.error("[DriverGuard] Pipeline error:", err);
  } finally {
    state.processingFrame = false;
  }
}

/* =========================================================
   DYNAMIC UPDATE UI FROM MODEL PREDICTIONS
========================================================= */
function updateUI(data) {
  const { drowsiness, distraction, safety_level, safety_message, alarm, inference_time_ms } = data;

  /* Latency */
  const latStr = `${inference_time_ms ?? "—"} ms`;
  el.inferenceTime.textContent = latStr;
  el.camLatencyTag.textContent = latStr;

  /* Drowsiness & Distraction Panels */
  if (drowsiness) updateDrowsinessPanel(drowsiness);
  if (distraction) updateDistractionPanel(distraction);

  /* Calculate Driver Safety Score & Driver Status */
  calculateSafetyScore(drowsiness, distraction);
  updateDriverStatusIndicators(drowsiness, distraction);

  /* Safety Level & Alerting */
  updateSafetyLevel(safety_level, safety_message);

  /* Cumulative Metrics & Distribution Counts */
  updateSessionMetrics(drowsiness, distraction, safety_level);

  /* Voice Synthesizer Alert */
  evaluateVoiceAlert(drowsiness, distraction, safety_level);

  /* Emergent Audio/Visual Alarm */
  if (alarm && !state.alarmShown && state.settings.criticalEnabled) {
    triggerAlarm(safety_level, safety_message);
  }
}

/* ─── Driver Safety Score Algorithm ────────────────────── */
function calculateSafetyScore(drowsiness, distraction) {
  let score = state.currentScore;

  const isDrowsy = drowsiness?.is_drowsy;
  const isDistracted = distraction?.is_distracted;
  const predDrowsy = drowsiness?.prediction;

  if (isDrowsy) {
    if (predDrowsy === "Closed") {
      const dur = Number(drowsiness?.drowsy_elapsed_seconds || 0);
      score -= dur > 1.5 ? 6 : 3;
    } else if (predDrowsy === "yawn") {
      score -= 2;
    }
  }

  if (isDistracted) {
    const dur = Number(distraction?.distracted_elapsed_seconds || 0);
    score -= dur > 2.0 ? 5 : 2;
  }

  if (!isDrowsy && !isDistracted && drowsiness?.face_detected) {
    score += 1.0; // gradual recovery
  }

  score = clamp(Math.round(score), 10, 100);
  state.currentScore = score;
  state.scoreHistory.push(score);
  if (state.scoreHistory.length > 30) state.scoreHistory.shift();

  /* Update Circular Progress Ring (circumference: ~314.16) */
  const dashOffset = 314.16 * (1 - score / 100);
  el.scoreRingFill.style.strokeDashoffset = dashOffset;
  el.scoreValue.textContent = score;

  /* Determine Rating Category & Color (Orange Brand Accent) */
  let color = "#16A34A";
  let label = "EXCELLENT";
  if (score < 50) {
    color = "#DC2626";
    label = "CRITICAL";
  } else if (score < 75) {
    color = "#F59E0B";
    label = "WARNING";
  } else if (score < 90) {
    color = "#F97316";
    label = "GOOD";
  }

  el.scoreRingFill.style.stroke = color;
  el.scoreLabel.textContent = label;
  el.scoreLabel.style.color = color;
  el.trendCurrentScoreTag.textContent = `Score: ${score}`;

  /* Update Trend Sparkline */
  drawTrendLine();
}

/* ─── Current Driver Status Group ──────────────────────── */
function updateDriverStatusIndicators(drowsiness, distraction) {
  const closed = drowsiness?.prediction === "Closed";
  const yawn   = drowsiness?.prediction === "yawn";
  const dist   = distraction?.is_distracted;

  /* Eyes */
  if (el.statusEyesText) {
    el.statusEyesText.textContent = closed ? "CLOSED" : "OPEN";
    el.statusEyesText.style.color = closed ? "var(--danger-red-dark)" : "var(--safe-green-dark)";
  }
  const dotEyes = el.pillEyes?.querySelector(".pill-dot, .pill-icon-dot");
  if (dotEyes) dotEyes.className = `pill-dot ${closed ? "danger" : "safe"}`;

  /* Yawn */
  if (el.statusYawnText) {
    el.statusYawnText.textContent = yawn ? "DETECTED" : "NO YAWN";
    el.statusYawnText.style.color = yawn ? "var(--warn-orange-dark)" : "var(--safe-green-dark)";
  }
  const dotYawn = el.pillYawn?.querySelector(".pill-dot, .pill-icon-dot");
  if (dotYawn) dotYawn.className = `pill-dot ${yawn ? "warn" : "safe"}`;

  /* Distraction */
  if (el.statusDistractText) {
    el.statusDistractText.textContent = dist ? "DISTRACTED" : "SAFE";
    el.statusDistractText.style.color = dist ? "var(--danger-red-dark)" : "var(--safe-green-dark)";
  }
  const dotDist = el.pillDistract?.querySelector(".pill-dot, .pill-icon-dot");
  if (dotDist) dotDist.className = `pill-dot ${dist ? "danger" : "safe"}`;

  /* Camera Overlay Live Status Chips */
  const ovEyes = $("camOvEyes");
  const ovEyesText = $("camOvEyesText");
  const ovYawn = $("camOvYawn");
  const ovYawnText = $("camOvYawnText");
  const ovDistract = $("camOvDistract");
  const ovDistractText = $("camOvDistractText");

  if (ovEyes && ovEyesText) {
    ovEyes.className = `cam-ov-chip ${closed ? "danger" : "safe"}`;
    ovEyesText.textContent = closed ? "EYES CLOSED" : "EYES OPEN";
  }
  if (ovYawn && ovYawnText) {
    ovYawn.className = `cam-ov-chip ${yawn ? "warn" : "safe"}`;
    ovYawnText.textContent = yawn ? "YAWN DETECTED" : "NO YAWN";
  }
  if (ovDistract && ovDistractText) {
    ovDistract.className = `cam-ov-chip ${dist ? "danger" : "safe"}`;
    ovDistractText.textContent = dist ? (distraction?.prediction || "DISTRACTED").toUpperCase() : "NO DISTRACTION";
  }

  /* Face Tag */
  const faceOk = drowsiness?.face_detected;
  if (el.camFaceTag) {
    el.camFaceTag.textContent = faceOk ? "FACE: TRACKED" : "FACE: NO FACE";
    el.camFaceTag.style.color = faceOk ? "#60A5FA" : "#F87171";
  }
}

/* ─── Safety Level & Banner ────────────────────────────── */
function updateSafetyLevel(level, message) {
  const map = {
    SAFE:        { badge: "SAFE",        cls: "badge-safe",     video: "v-safe",     wrap: "active",     dot: "#16A34A" },
    DROWSY:      { badge: "DROWSY",      cls: "badge-danger",   video: "v-drowsy",   wrap: "drowsy",     dot: "#DC2626" },
    DISTRACTED:  { badge: "DISTRACTED",  cls: "badge-warn",     video: "v-distract", wrap: "distracted", dot: "#F97316" },
    CRITICAL:    { badge: "CRITICAL",    cls: "badge-critical", video: "v-critical", wrap: "critical",   dot: "#DC2626" },
    NO_FACE:     { badge: "NO FACE",     cls: "badge-muted",    video: "",           wrap: "active",     dot: "#94A3B8" },
    WAITING:     { badge: "WAITING",     cls: "badge-muted",    video: "",           wrap: "active",     dot: "#94A3B8" },
    MONITORING:  { badge: "MONITORING",  cls: "badge-muted",    video: "",           wrap: "active",     dot: "#F97316" },
  };

  const cfg = map[level] ?? map["WAITING"];
  setSafetyBadge(cfg.badge, cfg.cls);
  setVideoStatus(cfg.badge, cfg.video);

  el.videoWrap.className = `video-wrap ${cfg.wrap}`;

  /* Update Hero Driver Status in Score Panel */
  const heroText = $("heroStatusText");
  const heroIcon = $("heroStatusIcon");
  const heroSub  = $("heroStatusSub");
  if (heroText && heroIcon) {
    if (level === "CRITICAL" || level === "DROWSY") {
      heroIcon.textContent = "🔴";
      heroText.textContent = "CRITICAL ALERT";
      heroText.style.color = "var(--danger-red)";
      if (heroSub) heroSub.textContent = "Driver drowsiness / critical hazard detected";
    } else if (level === "DISTRACTED") {
      heroIcon.textContent = "🟠";
      heroText.textContent = "ATTENTION NEEDED";
      heroText.style.color = "var(--orange-primary)";
      if (heroSub) heroSub.textContent = "Driver is distracted from the road";
    } else {
      heroIcon.textContent = "🟢";
      heroText.textContent = "ALERT";
      heroText.style.color = "var(--safe-green)";
      if (heroSub) heroSub.textContent = "Driver is attentive and fully responsive";
    }
  }

  /* Update Alert Strip Banner */
  const banner = el.alertBanner;
  const bannerText = el.alertBannerText;
  const statusIcon = $("alertStatusIcon");
  const stripBadge = el.alertStripBadge;

  if (level === "CRITICAL" || level === "DROWSY") {
    banner.className = "alert-banner alert-danger";
    if (statusIcon) statusIcon.textContent = "🔴";
    if (stripBadge) stripBadge.textContent = "CRITICAL SAFETY ALERT";
    if (bannerText) bannerText.textContent = message || "Driver is drowsy and distracted.";
    banner.hidden = false;
  } else if (level === "DISTRACTED") {
    banner.className = "alert-banner alert-warning";
    if (statusIcon) statusIcon.textContent = "🟠";
    if (stripBadge) stripBadge.textContent = "ATTENTION REQUIRED";
    if (bannerText) bannerText.textContent = message || "Drowsiness / inattention indicators detected.";
    banner.hidden = false;
  } else {
    banner.className = "alert-banner alert-safe";
    if (statusIcon) statusIcon.textContent = "🟢";
    if (stripBadge) stripBadge.textContent = "DRIVER SAFE";
    if (bannerText) bannerText.textContent = "Driver is alert and focused.";
    banner.hidden = false;
  }

  /* Safety Metric Pill */
  if (el.statSafety) el.statSafety.textContent = cfg.badge;
  if (el.safetyIndicatorDot) el.safetyIndicatorDot.style.backgroundColor = cfg.dot;

  /* Check for Alert History & Timeline Event creation */
  if (level === "DROWSY" || level === "DISTRACTED" || level === "CRITICAL") {
    recordAlertEvent(level, message);
  }
}

/* ─── Drowsiness Panel ─────────────────────────────────── */
function updateDrowsinessPanel(d) {
  const isDrowsy    = d.is_drowsy;
  const noFace      = !d.face_detected;
  const isUncertain = d.status === "LOW CONFIDENCE" || d.status === "UNCERTAIN";

  const badgeCls = isDrowsy ? "badge-danger" : isUncertain ? "badge-muted" : "badge-safe";
  const badgeTxt = isDrowsy ? "DROWSY" : noFace ? "NO FACE" : isUncertain ? "UNCERTAIN" : "ALERT";
  setBadge(el.drowsinessBadge, badgeTxt, badgeCls);

  el.drowsinessPanel.className =
    `panel detection-panel compact-panel ${isDrowsy ? "state-drowsy" : noFace ? "" : "state-safe"}`;

  el.drowsinessIcon.textContent = isDrowsy ? "!" : noFace ? "?" : "✓";
  el.drowsinessIcon.className   = `det-icon mini-icon ${isDrowsy ? "drowsy" : noFace ? "" : "safe"}`;

  el.drowsinessLabel.textContent = formatDrowsinessLabel(d.prediction);
  el.drowsinessRaw.textContent   = `Raw: ${formatDrowsinessLabel(d.raw_prediction)}`;
  el.drowsinessLabel.style.color = isDrowsy ? "var(--clr-danger)" : "var(--navy-dark)";

  const conf = clamp(Number(d.confidence ?? 0), 0, 100);
  el.drowsinessConf.textContent = `${conf.toFixed(1)}%`;
  setBar(el.drowsinessBar, conf, isDrowsy ? "prog-fill drowsy-fill" : "prog-fill alert-fill");

  const probs = d.probabilities ?? {};
  setProbRow("pClosed", "bClosed", probs["Closed"],  true);
  setProbRow("pOpen",   "bOpen",   probs["Open"],    false);
  setProbRow("pNoYawn", "bNoYawn", probs["no_yawn"], false);
  setProbRow("pYawn",   "bYawn",   probs["yawn"],    true);

  el.drowsyDuration.textContent = `${Number(d.drowsy_elapsed_seconds ?? 0).toFixed(1)} s`;
  el.drowsyFrames.textContent   = d.drowsy_frame_count ?? 0;
  el.faceDetected.textContent   = d.face_detected ? "YES" : "NO";
  el.faceDetected.style.color   = d.face_detected ? "var(--clr-safe)" : "var(--clr-warn)";

  updateDriverStatusIndicators(d, null);
}

/* ─── Distraction Panel ────────────────────────────────── */
function updateDistractionPanel(d) {
  const isDistracted = d.is_distracted;
  const isUncertain  = d.status === "UNCERTAIN";

  const badgeCls = isDistracted ? "badge-warn" : isUncertain ? "badge-muted" : "badge-safe";
  const badgeTxt = isDistracted ? "DISTRACTED" : isUncertain ? "UNCERTAIN" : "NOT DISTRACTED";
  setBadge(el.distractionBadge, badgeTxt, badgeCls);

  el.distractionPanel.className =
    `panel detection-panel compact-panel ${isDistracted ? "state-warn" : isUncertain ? "" : "state-safe"}`;

  el.distractionIcon.textContent = isDistracted ? "!" : "✓";
  el.distractionIcon.className   = `det-icon mini-icon ${isDistracted ? "warn" : isUncertain ? "" : "safe"}`;

  el.distractionLabel.textContent = d.prediction ?? "Waiting…";
  el.distractionRaw.textContent   = `Raw: ${d.raw_prediction ?? "—"}`;
  el.distractionLabel.style.color = isDistracted ? "var(--clr-warn)" : "var(--navy-dark)";

  const conf = clamp(Number(d.confidence ?? 0), 0, 100);
  el.distractionConf.textContent = `${conf.toFixed(1)}%`;
  setBar(el.distractionBar, conf, isDistracted ? "prog-fill warn-fill" : "prog-fill alert-fill");

  const top3 = d.top_classes ?? [];
  const rows = [
    { name: el.top3Name0, conf: el.top3Conf0, row: el.top3_0 },
    { name: el.top3Name1, conf: el.top3Conf1, row: el.top3_1 },
    { name: el.top3Name2, conf: el.top3Conf2, row: el.top3_2 },
  ];
  rows.forEach((r, i) => {
    const item = top3[i];
    if (item) {
      r.name.textContent = item.class_name;
      r.conf.textContent = `${Number(item.confidence ?? 0).toFixed(1)}%`;
      r.row.className    = `top3-item compact-item${i === 0 ? " is-top" : ""}`;
    } else {
      r.name.textContent = "—";
      r.conf.textContent = "—";
      r.row.className    = "top3-item compact-item";
    }
  });

  el.distractDuration.textContent = `${Number(d.distracted_elapsed_seconds ?? 0).toFixed(1)} s`;
  el.distractFrames.textContent   = d.distracted_frame_count ?? 0;
}

/* =========================================================
   SESSION OVERVIEW, DONUT & TREND CHARTS
========================================================= */
function updateSessionMetrics(drowsiness, distraction, safetyLevel) {
  const frames = Math.max(
    Number(drowsiness?.total_frames ?? 0),
    Number(distraction?.total_frames ?? 0)
  );

  if (frames > state.maxFrames) state.maxFrames = frames;
  if ((drowsiness?.drowsy_events ?? 0) > state.maxDrowsyEvents)
    state.maxDrowsyEvents = drowsiness.drowsy_events;
  if ((distraction?.distracted_events ?? 0) > state.maxDistractEvents)
    state.maxDistractEvents = distraction.distracted_events;

  /* Count yawns specifically */
  if (drowsiness?.prediction === "yawn" && drowsiness?.confidence > 0.4) {
    state.maxYawnEvents++;
  }

  el.statFrames.textContent         = state.maxFrames.toLocaleString();
  el.statDrowsyEvents.textContent   = state.maxDrowsyEvents;
  el.statDistractEvents.textContent = state.maxDistractEvents;
  el.statYawnEvents.textContent     = Math.min(state.maxYawnEvents, state.maxDrowsyEvents);

  /* Average confidence computation */
  const curConf = (Number(drowsiness?.confidence || 0) + Number(distraction?.confidence || 0)) / 2;
  if (curConf > 0) {
    state.confidenceSum += curConf;
    state.confidenceCount++;
    const avg = state.confidenceSum / state.confidenceCount;
    el.statAvgConfidence.textContent = `${avg.toFixed(1)}%`;
  }

  /* Donut Distribution Counts */
  if (drowsiness?.prediction === "Open")   state.counts.eyesOpen++;
  if (drowsiness?.prediction === "Closed") state.counts.eyesClosed++;
  if (drowsiness?.prediction === "yawn")   state.counts.yawns++;
  if (distraction?.is_distracted)          state.counts.distractions++;

  el.cntEyesOpen.textContent     = state.counts.eyesOpen;
  el.cntEyesClosed.textContent   = state.counts.eyesClosed;
  el.cntYawns.textContent        = state.counts.yawns;
  el.cntDistractions.textContent = state.counts.distractions;

  updateDonutChart();
}

function updateDonutChart() {
  const total = state.counts.eyesOpen + state.counts.eyesClosed + state.counts.yawns + state.counts.distractions;
  if (total === 0) return;

  const C = 238.76; // Circumference of r=38
  const pOpen = (state.counts.eyesOpen / total) * C;
  const pYawn = (state.counts.yawns / total) * C;
  const pClosed = (state.counts.eyesClosed / total) * C;
  const pDist = (state.counts.distractions / total) * C;

  el.donutEyesOpen.style.strokeDasharray = `${pOpen} ${C}`;
  el.donutEyesOpen.style.strokeDashoffset = "0";

  el.donutYawn.style.strokeDasharray = `${pYawn} ${C}`;
  el.donutYawn.style.strokeDashoffset = `-${pOpen}`;

  el.donutEyesClosed.style.strokeDasharray = `${pClosed} ${C}`;
  el.donutEyesClosed.style.strokeDashoffset = `-${pOpen + pYawn}`;

  el.donutDistract.style.strokeDasharray = `${pDist} ${C}`;
  el.donutDistract.style.strokeDashoffset = `-${pOpen + pYawn + pClosed}`;
}

function drawTrendLine() {
  const pts = state.scoreHistory;
  if (!pts || pts.length < 2) return;

  const w = 300;
  const h = 60;
  const dx = w / (pts.length - 1);

  let pathD = `M 0 ${h - (pts[0] / 100) * (h - 10) - 5}`;
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(i * dx);
    const y = Math.round(h - (pts[i] / 100) * (h - 10) - 5);
    pathD += ` L ${x} ${y}`;
  }

  el.trendLine.setAttribute("d", pathD);
  el.trendArea.setAttribute("d", `${pathD} L ${w} ${h} L 0 ${h} Z`);
}

/* =========================================================
   LIVE HORIZONTAL TIMELINE & ALERT HISTORY
========================================================= */
let lastLoggedEvent = "";

function recordAlertEvent(level, message) {
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  const eventKey = `${level}-${message}`;

  if (eventKey === lastLoggedEvent) return; // avoid duplicate spam
  lastLoggedEvent = eventKey;

  const eventObj = {
    time: timeStr,
    level: level,
    desc: message || `${level} detected`,
    score: state.currentScore,
  };

  state.alertHistory.unshift(eventObj);
  if (state.alertHistory.length > 50) state.alertHistory.pop();

  el.alertTabCount.textContent = state.alertHistory.length;

  /* Add to Timeline Rail */
  const chipCls = level === "CRITICAL" || level === "DROWSY" ? "chip-danger" : "chip-warn";
  addTimelineEvent(`${timeStr} • ${level}`, chipCls);

  /* Update Recent Alert History Card */
  renderRecentAlerts();

  /* Auto snapshot on critical events */
  if (level === "CRITICAL" && state.monitoring) {
    captureSnapshot();
  }
}

function addTimelineEvent(text, chipClass) {
  const now = new Date().toTimeString().split(" ")[0];
  const chip = document.createElement("div");
  chip.className = `timeline-event-chip ${chipClass}`;
  chip.innerHTML = `<span class="event-time">${now}</span><span class="event-desc">${text}</span>`;

  el.timelineRail.appendChild(chip);
  while (el.timelineRail.children.length > 10) {
    el.timelineRail.removeChild(el.timelineRail.firstChild);
  }
  el.timelineRail.scrollLeft = el.timelineRail.scrollWidth;
}

function renderRecentAlerts() {
  if (el.historyEmptyState) {
    el.historyEmptyState.hidden = state.alertHistory.length !== 0;
  }

  if (el.alertHistoryList) {
    el.alertHistoryList.innerHTML = "";
    state.alertHistory.slice(0, 4).forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";
      const tagCls = item.level === "CRITICAL" || item.level === "DROWSY" ? "tag-danger" : "tag-warn";
      div.innerHTML = `
        <span class="history-time">${item.time}</span>
        <span class="history-tag ${tagCls}">${item.level}</span>
        <span class="history-conf">Score: ${item.score}</span>
      `;
      el.alertHistoryList.appendChild(div);
    });
  }

  /* Also populate full table in Alerts tab */
  renderFullAlertTable();
}

function renderFullAlertTable() {
  if (!el.fullAlertsTbody) return;
  el.fullAlertsTbody.innerHTML = "";
  if (state.alertHistory.length === 0) {
    el.fullAlertsTbody.innerHTML = `<tr><td colspan="6" class="table-empty">No alerts recorded yet.</td></tr>`;
    return;
  }

  state.alertHistory.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.time}</td>
      <td><span class="history-tag ${item.level === "CRITICAL" ? "tag-danger" : "tag-warn"}">${item.level}</span></td>
      <td>${item.desc}</td>
      <td>—</td>
      <td><strong>${item.score}/100</strong></td>
      <td>${state.snapshots.length > 0 ? "Saved" : "—"}</td>
    `;
    el.fullAlertsTbody.appendChild(tr);
  });
}

function clearAlertHistory() {
  state.alertHistory = [];
  if (el.alertTabCount) el.alertTabCount.textContent = "0";
  renderRecentAlerts();
  renderFullAlertTable();
}

/* =========================================================
   VOICE ALERT (WEB SPEECH API)
========================================================= */
function evaluateVoiceAlert(drowsiness, distraction, safetyLevel) {
  if (!state.settings.voiceEnabled) return;

  const now = performance.now();
  if (now - state.lastVoiceTs < CONFIG.voiceCooldownMs) return;

  let phrase = null;
  if (safetyLevel === "CRITICAL") {
    phrase = "Critical safety warning. Please focus on driving immediately.";
  } else if (drowsiness?.prediction === "Closed" && (drowsiness?.drowsy_elapsed_seconds || 0) > 1.2) {
    phrase = "Warning. Drowsiness detected. Please stay alert.";
  } else if (drowsiness?.prediction === "yawn") {
    phrase = "Fatigue detected. Please remain attentive.";
  } else if (distraction?.is_distracted && (distraction?.distracted_elapsed_seconds || 0) > 2.0) {
    phrase = "Distraction detected. Please keep eyes on the road.";
  }

  if (phrase) {
    speakVoiceAlert(phrase);
    state.lastVoiceTs = now;
  }
}

function speakVoiceAlert(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // clear queue
    const utter = new SpeechSynthesisUtterance(text);
    utter.volume = state.settings.volume;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn("[DriverGuard] Speech synthesis error:", e);
  }
}

function toggleVoiceAlert() {
  state.settings.voiceEnabled = !state.settings.voiceEnabled;
  el.voiceText.textContent = `Voice: ${state.settings.voiceEnabled ? "ON" : "OFF"}`;
  el.btnVoiceToggle.classList.toggle("active", state.settings.voiceEnabled);
  el.setVoiceToggle.checked = state.settings.voiceEnabled;
}

/* =========================================================
   FOCUS MODE & FULLSCREEN CAMERA
========================================================= */
function enterFocusMode() {
  document.body.classList.add("focus-mode-active");
  el.btnExitFocus.hidden = false;
}

function exitFocusMode() {
  document.body.classList.remove("focus-mode-active");
  el.btnExitFocus.hidden = true;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    el.videoWrap.requestFullscreen?.() || el.videoWrap.webkitRequestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

/* =========================================================
   SNAPSHOT CAPTURE & GALLERY
========================================================= */
function captureSnapshot() {
  if (!state.monitoring) {
    alert("Camera is not active. Click Start Monitoring first.");
    return;
  }
  try {
    const dataUrl = el.captureCanvas.toDataURL("image/jpeg", 0.85);
    const now = new Date().toTimeString().split(" ")[0];
    const snap = {
      time: now,
      score: state.currentScore,
      src: dataUrl,
    };
    state.snapshots.unshift(snap);
    if (state.snapshots.length > 20) state.snapshots.pop();

    el.galleryCount.textContent = state.snapshots.length;
    renderGallery();
  } catch (e) {
    console.error("[DriverGuard] Snapshot error:", e);
  }
}

function renderGallery() {
  el.galleryGrid.innerHTML = "";
  if (state.snapshots.length === 0) {
    el.galleryGrid.innerHTML = `<div class="table-empty">No snapshots captured yet.</div>`;
    return;
  }
  state.snapshots.forEach(s => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${s.src}" class="gallery-img" alt="Snapshot" />
      <div class="gallery-info">
        <span>${s.time}</span>
        <strong>Score: ${s.score}</strong>
      </div>
    `;
    el.galleryGrid.appendChild(card);
  });
}

function clearGallery() {
  state.snapshots = [];
  el.galleryCount.textContent = "0";
  renderGallery();
}

/* =========================================================
   SESSION TIMER & COMPLETE MODAL
========================================================= */
function startSessionTimer() {
  stopSessionTimer();
  state.sessionClockTimer = setInterval(() => {
    state.sessionSeconds++;
    const hrs = String(Math.floor(state.sessionSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((state.sessionSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(state.sessionSeconds % 60).padStart(2, "0");
    el.sessionTimer.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function stopSessionTimer() {
  if (state.sessionClockTimer) {
    clearInterval(state.sessionClockTimer);
    state.sessionClockTimer = null;
  }
}

function openSessionCompleteModal() {
  el.compTime.textContent = el.sessionTimer.textContent;
  el.compFrames.textContent = state.maxFrames.toLocaleString();
  el.compDrowsy.textContent = state.maxDrowsyEvents;
  el.compYawns.textContent = state.maxYawnEvents;
  el.compDistract.textContent = state.maxDistractEvents;
  el.completeScoreCircle.textContent = state.currentScore;
  el.completeScoreHeading.textContent = `Driver Safety Score: ${state.currentScore} / 100`;

  el.sessionCompleteModal.hidden = false;
}

/* =========================================================
   REPORT DOCUMENT & EXPORT (CSV & PDF)
========================================================= */
function updateReportDocument() {
  el.reportDate.textContent = new Date().toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
  el.repTime.textContent     = el.sessionTimer.textContent;
  el.repFrames.textContent   = state.maxFrames.toLocaleString();
  el.repScore.textContent    = `${state.currentScore} / 100`;
  el.repDrowsy.textContent   = state.maxDrowsyEvents;
  el.repYawns.textContent    = state.maxYawnEvents;
  el.repDistract.textContent = state.maxDistractEvents;
}

function exportSessionCSV() {
  const rows = [
    ["Timestamp", "Severity", "Event", "SafetyScore"],
    ...state.alertHistory.map(a => [a.time, a.level, `"${a.desc}"`, a.score]),
  ];
  if (rows.length === 1) {
    rows.push([new Date().toLocaleTimeString(), "INFO", "Session Finished", state.currentScore]);
  }

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `DriverGuard_Session_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportSessionPDF() {
  switchTab("report");
  setTimeout(() => window.print(), 300);
}

/* =========================================================
   SETTINGS MODAL LOGIC
========================================================= */
function initSettings() {
  el.setVoiceToggle.addEventListener("change", e => {
    state.settings.voiceEnabled = e.target.checked;
    el.voiceText.textContent = `Voice: ${e.target.checked ? "ON" : "OFF"}`;
  });
  el.setVisualToggle.addEventListener("change", e => {
    state.settings.visualEnabled = e.target.checked;
  });
  el.setCriticalToggle.addEventListener("change", e => {
    state.settings.criticalEnabled = e.target.checked;
  });
  el.setVolumeSlider.addEventListener("input", e => {
    state.settings.volume = Number(e.target.value) / 100;
    el.setVolumeVal.textContent = `${e.target.value}%`;
  });
}

function openSettings() { el.settingsModal.hidden = false; }
function closeSettings() { el.settingsModal.hidden = true; }

/* =========================================================
   ALARM & BANNER HELPERS
========================================================= */
function triggerAlarm(level, message) {
  state.alarmShown = true;
  el.alarmTitle.textContent = `${level} ALERT DETECTED`;
  el.alarmBody.textContent  = message ?? "Driver fatigue or distraction warning detected.";
  el.alarmBackdrop.hidden   = false;
  playAlarmAudio();
}

function hideAlarm() {
  el.alarmBackdrop.hidden = true;
  state.alarmShown = false;
}

function showBanner(text, level = "CRITICAL") {
  el.alertBannerText.textContent = text;
  el.alertStripBadge.textContent = level;
  el.alertBanner.className = `alert-banner ${level === "DISTRACTED" ? "alert-warning" : "alert-critical"}`;
  el.alertBanner.hidden = false;
}

function hideBanner() {
  el.alertBanner.hidden = true;
}

function playAlarmAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25 * state.settings.volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    console.warn("[DriverGuard] Audio playback disabled:", e);
  }
}

/* =========================================================
   SESSION RESET
========================================================= */
async function resetSession() {
  try {
    await fetch(`${CONFIG.apiUrl}/api/reset`, { method: "POST" });
    resetUI();
    hideBanner();
    hideAlarm();
    console.log("[DriverGuard] Session reset.");
  } catch (err) {
    console.error("[DriverGuard] Reset error:", err);
  }
}

function resetUI() {
  state.maxFrames         = 0;
  state.maxDrowsyEvents   = 0;
  state.maxYawnEvents     = 0;
  state.maxDistractEvents = 0;
  state.confidenceSum     = 0;
  state.confidenceCount   = 0;
  state.sessionSeconds    = 0;
  state.currentScore      = 100;
  state.scoreHistory      = [100, 100, 100, 100, 100];
  state.counts            = { eyesOpen: 0, eyesClosed: 0, yawns: 0, distractions: 0 };
  state.alertHistory      = [];
  state.snapshots         = [];

  el.sessionTimer.textContent = "00:00:00";
  el.scoreValue.textContent = "100";
  el.scoreLabel.textContent = "EXCELLENT";
  el.scoreRingFill.style.strokeDashoffset = "0";
  el.scoreRingFill.style.stroke = "#10B981";

  setBadge(el.drowsinessBadge, "WAITING", "");
  el.drowsinessIcon.textContent = "?";
  el.drowsinessIcon.className = "det-icon mini-icon";
  el.drowsinessLabel.textContent = "Waiting…";
  el.drowsinessRaw.textContent = "Raw: —";
  el.drowsinessConf.textContent = "0%";
  setBar(el.drowsinessBar, 0, "prog-fill");
  setProbRow("pClosed", "bClosed", 0, true);
  setProbRow("pOpen", "bOpen", 0, false);
  setProbRow("pNoYawn", "bNoYawn", 0, false);
  setProbRow("pYawn", "bYawn", 0, true);
  el.drowsyDuration.textContent = "0.0 s";
  el.drowsyFrames.textContent = "0";
  el.faceDetected.textContent = "—";

  setBadge(el.distractionBadge, "WAITING", "");
  el.distractionIcon.textContent = "?";
  el.distractionIcon.className = "det-icon mini-icon";
  el.distractionLabel.textContent = "Waiting…";
  el.distractionRaw.textContent = "Raw: —";
  el.distractionConf.textContent = "0%";
  setBar(el.distractionBar, 0, "prog-fill");
  [0, 1, 2].forEach(i => {
    $(`top3Name${i}`).textContent = "—";
    $(`top3Conf${i}`).textContent = "—";
    $(`top3_${i}`).className = "top3-item compact-item";
  });
  el.distractDuration.textContent = "0.0 s";
  el.distractFrames.textContent = "0";

  setSafetyBadge("WAITING", "");
  setVideoStatus("WAITING", "");

  el.statFrames.textContent = "0";
  el.statDrowsyEvents.textContent = "0";
  el.statYawnEvents.textContent = "0";
  el.statDistractEvents.textContent = "0";
  el.statAvgConfidence.textContent = "—";
  el.statSafety.textContent = "—";
  el.safetyIndicatorDot.style.backgroundColor = "#94A3B8";

  el.inferenceTime.textContent = "— ms";
  el.fpsValue.textContent = "— fps";

  el.timelineRail.innerHTML = `<div class="timeline-event-chip chip-init"><span class="event-time">--:--:--</span><span class="event-desc">System Initialized</span></div>`;
  renderRecentAlerts();
  updateDonutChart();
  drawTrendLine();
}

/* =========================================================
   FPS TRACKING & HELPERS
========================================================= */
function trackFps() {
  state.frameCount++;
  const now = performance.now();
  const elapsed = now - state.fpsLastTs;
  if (elapsed >= 1000) {
    state.currentFps = Math.round(state.frameCount * 1000 / elapsed);
    el.fpsValue.textContent = `${state.currentFps} fps`;
    state.frameCount = 0;
    state.fpsLastTs  = now;
  }
}

function setSafetyBadge(text, cls) {
  el.safetyBadge.textContent = text;
  el.safetyBadge.className   = `safety-badge ${cls}`;
}

function setVideoStatus(text, cls) {
  el.videoStatusText.textContent = text;
  el.videoStatus.className       = `video-status ${cls}`;
}

function setBadge(elem, text, cls) {
  elem.textContent = text;
  elem.className   = `detection-badge ${cls}`;
}

function setBar(elem, pct, className) {
  elem.style.width = `${clamp(pct, 0, 100)}%`;
  elem.className   = className;
}

function setProbRow(valId, barId, prob, isDrowsy) {
  const pct = clamp(Number(prob ?? 0) * 100, 0, 100);
  $(valId).textContent = `${pct.toFixed(1)}%`;
  const bar = $(barId);
  bar.style.width = `${pct}%`;
  bar.className   = `prog-fill ${isDrowsy ? "drowsy-fill" : "alert-fill"}`;
}

function formatDrowsinessLabel(raw) {
  const map = {
    Closed:    "Eyes Closed",
    Open:      "Eyes Open",
    no_yawn:   "No Yawn",
    yawn:      "Yawn",
    "No Face": "No Face",
    Uncertain: "Uncertain",
    Waiting:   "Waiting",
  };
  return map[raw] ?? raw ?? "—";
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(Number(v) || 0, lo), hi);
}
