"use strict";

/**
 * DriverGuard — Dual-Model Driver Monitoring
 * ==========================================
 * Single camera → two independent deep-learning models:
 *   1. Drowsiness  (MobileNetV2 / Keras)
 *   2. Distraction (ResNet-18  / PyTorch)
 *
 * Frame pipeline:
 *   webcam → canvas capture → JPEG blob → POST /api/predict
 *   ← JSON { drowsiness: {...}, distraction: {...}, safety_level, alarm }
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
  captureQuality:    0.75,  // JPEG quality [0-1]
  captureWidthPx:    640,   // resize before sending — saves bandwidth
  healthPollMs:      4000,  // backend health-check interval
};

/* =========================================================
   DOM REFERENCES
========================================================= */
const $ = id => document.getElementById(id);

const el = {
  /* Header */
  statusDot:         $("statusDot"),
  statusText:        $("statusText"),
  fpsBadge:          $("fpsBadge"),

  /* Alert banner */
  alertBanner:       $("alertBanner"),
  alertBannerText:   $("alertBannerText"),
  alertBannerClose:  $("alertBannerClose"),

  /* Camera */
  cameraFeed:        $("cameraFeed"),
  captureCanvas:     $("captureCanvas"),
  videoWrap:         $("videoWrap"),
  videoStatus:       $("videoStatus"),
  videoStatusText:   $("videoStatusText"),
  cameraPlaceholder: $("cameraPlaceholder"),
  safetyBadge:       $("safetyBadge"),
  inferenceTime:     $("inferenceTime"),

  /* Buttons */
  btnStart:          $("btnStart"),
  btnStop:           $("btnStop"),
  btnReset:          $("btnReset"),

  /* Drowsiness panel */
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

  /* Distraction panel */
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

  /* Stats bar */
  statFrames:        $("statFrames"),
  statDrowsyEvents:  $("statDrowsyEvents"),
  statDistractEvents:$("statDistractEvents"),
  statSafety:        $("statSafety"),
  statModels:        $("statModels"),

  /* Alarm modal */
  alarmBackdrop:     $("alarmBackdrop"),
  alarmTitle:        $("alarmTitle"),
  alarmBody:         $("alarmBody"),
  btnDismissAlarm:   $("btnDismissAlarm"),
};

/* =========================================================
   APPLICATION STATE
========================================================= */
let state = {
  monitoring:      false,
  stream:          null,
  captureTimer:    null,
  healthTimer:     null,
  processingFrame: false,
  backendOnline:   false,
  alarmShown:      false,

  /* FPS tracking */
  frameCount:    0,
  fpsLastTs:     performance.now(),
  currentFps:    0,

  /* Max session stats (cumulative from backend) */
  maxFrames:        0,
  maxDrowsyEvents:  0,
  maxDistractEvents:0,
};

/* =========================================================
   INITIALISATION
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  resetUI();
  attachEventListeners();
  startHealthPoller();
  checkBackend();          // immediate first check
});

/* =========================================================
   EVENT LISTENERS
========================================================= */
function attachEventListeners() {
  el.btnStart.addEventListener("click", startCamera);
  el.btnStop.addEventListener("click", stopCamera);
  el.btnReset.addEventListener("click", resetSession);
  el.btnDismissAlarm.addEventListener("click", hideAlarm);
  el.alertBannerClose.addEventListener("click", hideBanner);

  /* Dismiss alarm on backdrop click */
  el.alarmBackdrop.addEventListener("click", e => {
    if (e.target === el.alarmBackdrop) hideAlarm();
  });

  /* Stop monitoring when page closes */
  window.addEventListener("beforeunload", stopCamera);
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

    /* Update models status in stats bar */
    if (data.models) {
      const nd = data.models.drowsiness?.num_classes ?? "?";
      const ni = data.models.distraction?.num_classes ?? "?";
      el.statModels.textContent = `${nd}+${ni} classes`;
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
   CAMERA — START / STOP
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

    setSafetyBadge("MONITORING", "badge-muted");
    setVideoStatus("MONITORING", "");

    startCaptureLoop();
    console.log("[DriverGuard] Camera started.");

  } catch (err) {
    console.error("[DriverGuard] Camera error:", err);
    const msg = err.name === "NotAllowedError"
      ? "Camera access was denied.\nPlease allow camera permission in your browser and try again."
      : `Unable to access the camera:\n${err.message}`;
    alert(msg);
  }
}

function stopCamera() {
  if (!state.monitoring && !state.stream) return;

  state.monitoring = false;
  stopCaptureLoop();

  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }

  el.cameraFeed.srcObject = null;
  el.cameraPlaceholder.classList.remove("hidden");
  el.videoWrap.className = "video-wrap";   // remove all state classes

  el.btnStart.disabled = false;
  el.btnStop.disabled  = true;

  setSafetyBadge("STOPPED", "badge-muted");
  setVideoStatus("STOPPED", "");
  console.log("[DriverGuard] Camera stopped.");
}

/* =========================================================
   CAPTURE LOOP
========================================================= */
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
  if (!state.monitoring) return;
  if (state.processingFrame) return;                    // drop frame if still busy
  if (!el.cameraFeed.videoWidth || !el.cameraFeed.videoHeight) return;

  state.processingFrame = true;

  try {
    /* ── Capture frame ── */
    const ctx    = el.captureCanvas.getContext("2d");
    const aspect = el.cameraFeed.videoHeight / el.cameraFeed.videoWidth;
    const w      = CONFIG.captureWidthPx;
    const h      = Math.round(w * aspect);

    el.captureCanvas.width  = w;
    el.captureCanvas.height = h;

    /* Draw un-mirrored (CSS mirror is cosmetic only; model sees the real frame) */
    ctx.drawImage(el.cameraFeed, 0, 0, w, h);

    const blob = await new Promise(res =>
      el.captureCanvas.toBlob(res, "image/jpeg", CONFIG.captureQuality)
    );
    if (!blob) return;

    /* ── Send to backend ── */
    const form = new FormData();
    form.append("frame", blob, "frame.jpg");

    const res  = await fetch(`${CONFIG.apiUrl}/api/predict`, {
      method: "POST",
      body:   form,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Prediction failed");

    setBackendOnline(true);
    updateUI(data);
    trackFps();

  } catch (err) {
    console.error("[DriverGuard] Frame error:", err);
    setBackendOnline(false);
  } finally {
    state.processingFrame = false;
  }
}

/* =========================================================
   UPDATE UI FROM API RESPONSE
========================================================= */
function updateUI(data) {
  const { drowsiness, distraction, safety_level, safety_message,
          alarm, inference_time_ms } = data;

  /* ── Inference time ── */
  el.inferenceTime.textContent = `${inference_time_ms ?? "—"} ms`;

  /* ── Overall safety ── */
  updateSafetyLevel(safety_level, safety_message);

  /* ── Drowsiness panel ── */
  if (drowsiness) updateDrowsinessPanel(drowsiness);

  /* ── Distraction panel ── */
  if (distraction) updateDistractionPanel(distraction);

  /* ── Stats bar ── */
  updateStats(drowsiness, distraction, safety_level);

  /* ── Alarm ── */
  if (alarm && !state.alarmShown) {
    triggerAlarm(safety_level, safety_message);
  }
}

/* ─── Safety level ─────────────────────────────────────── */
function updateSafetyLevel(level, message) {
  const map = {
    SAFE:        { badge: "SAFE",        cls: "badge-safe",     video: "v-safe",     wrap: "active"     },
    DROWSY:      { badge: "DROWSY",      cls: "badge-danger",   video: "v-drowsy",   wrap: "drowsy"     },
    DISTRACTED:  { badge: "DISTRACTED",  cls: "badge-warn",     video: "v-distract", wrap: "distracted" },
    CRITICAL:    { badge: "CRITICAL",    cls: "badge-critical", video: "v-critical", wrap: "critical"   },
    NO_FACE:     { badge: "NO FACE",     cls: "badge-muted",    video: "",           wrap: "active"     },
    WAITING:     { badge: "WAITING",     cls: "badge-muted",    video: "",           wrap: "active"     },
    MONITORING:  { badge: "MONITORING",  cls: "badge-muted",    video: "",           wrap: "active"     },
  };

  const cfg = map[level] ?? map["WAITING"];
  setSafetyBadge(cfg.badge, cfg.cls);
  setVideoStatus(cfg.badge, cfg.video);

  /* Update video-wrap state class */
  el.videoWrap.className = `video-wrap ${cfg.wrap}`;

  /* Show inline alert banner for danger states */
  if (level === "DROWSY" || level === "DISTRACTED" || level === "CRITICAL") {
    showBanner(message || cfg.badge, level);
  } else {
    hideBanner();
  }

  /* Update safety stat value & dynamic indicator dot in bottom summary bar */
  const statSafetyDot = document.querySelector(".safety-indicator-dot");
  if (statSafetyDot) {
    const dotColors = {
      SAFE:        "#10B981",
      DROWSY:      "#EF4444",
      DISTRACTED:  "#F59E0B",
      CRITICAL:    "#DC2626",
      WAITING:     "#94A3B8",
      MONITORING:  "#2563EB",
    };
    statSafetyDot.style.backgroundColor = dotColors[level] || "#94A3B8";
  }
  el.statSafety.textContent = cfg.badge;
  if (level === "SAFE") el.statSafety.style.color = "#059669";
  else if (level === "DROWSY") el.statSafety.style.color = "#DC2626";
  else if (level === "DISTRACTED") el.statSafety.style.color = "#D97706";
  else if (level === "CRITICAL") el.statSafety.style.color = "#B91C1C";
  else el.statSafety.style.color = "var(--navy-dark)";
}

/* ─── Drowsiness panel ─────────────────────────────────── */
function updateDrowsinessPanel(d) {
  const isDrowsy    = d.is_drowsy;
  const noFace      = !d.face_detected;
  const isUncertain = d.status === "LOW CONFIDENCE" || d.status === "UNCERTAIN";

  /* Badge */
  const badgeCls = isDrowsy ? "badge-danger" : isUncertain ? "badge-muted" : "badge-safe";
  const badgeTxt = isDrowsy ? "DROWSY" : noFace ? "NO FACE" : isUncertain ? "UNCERTAIN" : "ALERT";
  setBadge(el.drowsinessBadge, badgeTxt, badgeCls);

  /* Panel border */
  el.drowsinessPanel.className =
    `panel detection-panel ${isDrowsy ? "state-drowsy" : noFace ? "" : "state-safe"}`;

  /* Icon */
  el.drowsinessIcon.textContent = isDrowsy ? "!" : noFace ? "?" : "✓";
  el.drowsinessIcon.className   =
    `det-icon ${isDrowsy ? "drowsy" : noFace ? "" : "safe"}`;

  /* Label */
  el.drowsinessLabel.textContent = formatDrowsinessLabel(d.prediction);
  el.drowsinessRaw.textContent   = `Raw: ${formatDrowsinessLabel(d.raw_prediction)}`;
  el.drowsinessLabel.style.color = isDrowsy ? "var(--clr-danger)" : "var(--clr-text)";

  /* Confidence */
  const conf = clamp(Number(d.confidence ?? 0), 0, 100);
  el.drowsinessConf.textContent = `${conf.toFixed(1)}%`;
  setBar(el.drowsinessBar, conf,
    isDrowsy ? "prog-fill drowsy-fill" : "prog-fill alert-fill");

  /* Class probabilities */
  const probs = d.probabilities ?? {};
  setProbRow("pClosed", "bClosed", probs["Closed"],  true);
  setProbRow("pOpen",   "bOpen",   probs["Open"],    false);
  setProbRow("pNoYawn", "bNoYawn", probs["no_yawn"], false);
  setProbRow("pYawn",   "bYawn",   probs["yawn"],    true);

  /* Timing */
  el.drowsyDuration.textContent = `${Number(d.drowsy_elapsed_seconds ?? 0).toFixed(1)} s`;
  el.drowsyFrames.textContent   = d.drowsy_frame_count ?? 0;
  el.faceDetected.textContent   = d.face_detected ? "YES" : "NO";
  el.faceDetected.style.color   = d.face_detected ? "var(--clr-safe)" : "var(--clr-warn)";
}

/* ─── Distraction panel ────────────────────────────────── */
function updateDistractionPanel(d) {
  const isDistracted = d.is_distracted;
  const isUncertain  = d.status === "UNCERTAIN";

  /* Badge */
  const badgeCls = isDistracted ? "badge-warn" : isUncertain ? "badge-muted" : "badge-safe";
  const badgeTxt = isDistracted ? "DISTRACTED" : isUncertain ? "UNCERTAIN" : "NOT DISTRACTED";
  setBadge(el.distractionBadge, badgeTxt, badgeCls);

  /* Panel border */
  el.distractionPanel.className =
    `panel detection-panel ${isDistracted ? "state-warn" : isUncertain ? "" : "state-safe"}`;

  /* Icon */
  el.distractionIcon.textContent = isDistracted ? "!" : "✓";
  el.distractionIcon.className   =
    `det-icon ${isDistracted ? "warn" : isUncertain ? "" : "safe"}`;

  /* Label */
  el.distractionLabel.textContent = d.prediction ?? "Waiting…";
  el.distractionRaw.textContent   = `Raw: ${d.raw_prediction ?? "—"}`;
  el.distractionLabel.style.color = isDistracted ? "var(--clr-warn)" : "var(--clr-text)";

  /* Confidence */
  const conf = clamp(Number(d.confidence ?? 0), 0, 100);
  el.distractionConf.textContent = `${conf.toFixed(1)}%`;
  setBar(el.distractionBar, conf,
    isDistracted ? "prog-fill warn-fill" : "prog-fill alert-fill");

  /* Top-3 */
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
      r.row.className    = `top3-item${i === 0 ? " is-top" : ""}`;
    } else {
      r.name.textContent = "—";
      r.conf.textContent = "—";
      r.row.className    = "top3-item";
    }
  });

  /* Timing */
  el.distractDuration.textContent = `${Number(d.distracted_elapsed_seconds ?? 0).toFixed(1)} s`;
  el.distractFrames.textContent   = d.distracted_frame_count ?? 0;
}

/* ─── Stats bar ────────────────────────────────────────── */
function updateStats(drowsiness, distraction, safetyLevel) {
  /* Use the higher of the two frame counters */
  const frames = Math.max(
    Number(drowsiness?.total_frames  ?? 0),
    Number(distraction?.total_frames ?? 0)
  );

  if (frames > state.maxFrames)          state.maxFrames          = frames;
  if ((drowsiness?.drowsy_events   ?? 0) > state.maxDrowsyEvents)
      state.maxDrowsyEvents  = drowsiness.drowsy_events;
  if ((distraction?.distracted_events ?? 0) > state.maxDistractEvents)
      state.maxDistractEvents = distraction.distracted_events;

  el.statFrames.textContent        = state.maxFrames;
  el.statDrowsyEvents.textContent  = state.maxDrowsyEvents;
  el.statDistractEvents.textContent= state.maxDistractEvents;
}

/* =========================================================
   ALARM
========================================================= */
function triggerAlarm(level, message) {
  state.alarmShown = true;

  const titleMap = {
    DROWSY:     "⚠ DROWSINESS DETECTED",
    DISTRACTED: "⚠ DISTRACTION DETECTED",
    CRITICAL:   "⚠ CRITICAL ALERT",
  };

  el.alarmTitle.textContent = titleMap[level] ?? "⚠ ALERT";
  el.alarmBody.textContent  = message ?? "Please stay attentive.";
  el.alarmBackdrop.hidden   = false;

  playAlarmSound();
}

function hideAlarm() {
  el.alarmBackdrop.hidden = true;
  state.alarmShown = false;
}

/* ─── Inline banner (non-blocking) ─────────────────────── */
function showBanner(text, level = "CRITICAL") {
  el.alertBannerText.textContent = text;
  const isWarn = level === "DISTRACTED";
  el.alertBanner.className = `alert-banner ${isWarn ? "alert-warning" : "alert-critical"}`;
  el.alertBanner.hidden = false;
}

function hideBanner() {
  el.alertBanner.hidden = true;
}

/* ─── Audio alarm ──────────────────────────────────────── */
function playAlarmSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    const ctx  = new Ctx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 880;

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.28,  ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => ctx.close(), 1200);
  } catch (e) {
    console.warn("[DriverGuard] Alarm audio unavailable:", e);
  }
}

/* =========================================================
   RESET
========================================================= */
async function resetSession() {
  try {
    const res = await fetch(`${CONFIG.apiUrl}/api/reset`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    resetUI();
    hideBanner();
    hideAlarm();
    console.log("[DriverGuard] Session reset.");
  } catch (err) {
    console.error("[DriverGuard] Reset error:", err);
    alert("Could not reach the backend to reset.\nIs the server running?");
  }
}

/* =========================================================
   RESET UI (without stopping the camera)
========================================================= */
function resetUI() {
  state.maxFrames          = 0;
  state.maxDrowsyEvents    = 0;
  state.maxDistractEvents  = 0;
  state.alarmShown         = false;

  /* Drowsiness */
  setBadge(el.drowsinessBadge, "WAITING", "");
  el.drowsinessIcon.textContent  = "?";
  el.drowsinessIcon.className    = "det-icon";
  el.drowsinessLabel.textContent = "Waiting…";
  el.drowsinessRaw.textContent   = "Raw: —";
  el.drowsinessLabel.style.color = "";
  el.drowsinessConf.textContent  = "0%";
  setBar(el.drowsinessBar, 0, "prog-fill");
  setProbRow("pClosed", "bClosed", 0,  true);
  setProbRow("pOpen",   "bOpen",   0, false);
  setProbRow("pNoYawn", "bNoYawn", 0, false);
  setProbRow("pYawn",   "bYawn",   0,  true);
  el.drowsyDuration.textContent = "0.0 s";
  el.drowsyFrames.textContent   = "0";
  el.faceDetected.textContent   = "—";
  el.faceDetected.style.color   = "";
  el.drowsinessPanel.className  = "panel detection-panel";

  /* Distraction */
  setBadge(el.distractionBadge, "WAITING", "");
  el.distractionIcon.textContent  = "?";
  el.distractionIcon.className    = "det-icon";
  el.distractionLabel.textContent = "Waiting…";
  el.distractionRaw.textContent   = "Raw: —";
  el.distractionLabel.style.color = "";
  el.distractionConf.textContent  = "0%";
  setBar(el.distractionBar, 0, "prog-fill");
  [0,1,2].forEach(i => {
    $(`top3Name${i}`).textContent = "—";
    $(`top3Conf${i}`).textContent = "—";
    $(`top3_${i}`).className      = "top3-item";
  });
  el.distractDuration.textContent = "0.0 s";
  el.distractFrames.textContent   = "0";
  el.distractionPanel.className   = "panel detection-panel";

  /* Safety */
  setSafetyBadge("WAITING", "");
  setVideoStatus("WAITING", "");

  /* Stats */
  el.statFrames.textContent         = "0";
  el.statDrowsyEvents.textContent   = "0";
  el.statDistractEvents.textContent = "0";
  el.statSafety.textContent         = "—";

  /* Inference */
  el.inferenceTime.textContent = "— ms";

  /* FPS */
  el.fpsBadge.textContent = "— fps";
}

/* =========================================================
   FPS TRACKING
========================================================= */
function trackFps() {
  state.frameCount++;
  const now     = performance.now();
  const elapsed = now - state.fpsLastTs;
  if (elapsed >= 1000) {
    state.currentFps   = Math.round(state.frameCount * 1000 / elapsed);
    const fpsVal = document.getElementById("fpsValue");
    if (fpsVal) {
      fpsVal.textContent = `${state.currentFps} fps`;
    } else {
      el.fpsBadge.textContent = `${state.currentFps} fps`;
    }
    state.frameCount   = 0;
    state.fpsLastTs    = now;
  }
}

/* =========================================================
   UI HELPERS
========================================================= */

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

/**
 * Update a single probability row (value label + bar fill).
 * @param {string} valId   - element id for the percentage text
 * @param {string} barId   - element id for the progress bar fill
 * @param {number} prob    - probability [0.0–1.0] (decimal, not percent)
 * @param {boolean} isDrowsy - true → red fill, false → green fill
 */
function setProbRow(valId, barId, prob, isDrowsy) {
  const pct = clamp(Number(prob ?? 0) * 100, 0, 100);
  $(valId).textContent   = `${pct.toFixed(1)}%`;
  const bar = $(barId);
  bar.style.width  = `${pct}%`;
  bar.className    = `prog-fill ${isDrowsy ? "drowsy-fill" : "alert-fill"}`;
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
