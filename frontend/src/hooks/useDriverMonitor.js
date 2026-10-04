import { useState, useEffect, useRef, useCallback } from "react";

const CONFIG = {
  apiUrl: "", // Uses Vite proxy in dev or relative path
  captureIntervalMs: 1000 / 30, // 30 FPS capture rate
  captureQuality: 0.75,
  captureWidthPx: 640,
  healthPollMs: 4000,
  voiceCooldownMs: 8000,
};

export function useDriverMonitor() {
  const [monitoring, setMonitoring] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [modelStats, setModelStats] = useState({ drowsiness: 4, distraction: 10 });
  const [fps, setFps] = useState(0);
  const [latencyMs, setLatencyMs] = useState(null);

  // Safety Score & Status
  const [currentScore, setCurrentScore] = useState(100);
  const [scoreHistory, setScoreHistory] = useState([100, 100, 100, 100, 100]);
  const [safetyLevel, setSafetyLevel] = useState("SAFE");
  const [safetyMessage, setSafetyMessage] = useState("Driver is Attentive & Alert");
  const [alarmActive, setAlarmActive] = useState(false);

  // Detection Results
  const [drowsinessData, setDrowsinessData] = useState(null);
  const [distractionData, setDistractionData] = useState(null);

  // Cumulative Metrics
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [maxFrames, setMaxFrames] = useState(0);
  const [drowsyEvents, setDrowsyEvents] = useState(0);
  const [yawnEvents, setYawnEvents] = useState(0);
  const [distractEvents, setDistractEvents] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(null);

  // Category counts for Donut Chart
  const [counts, setCounts] = useState({
    eyesOpen: 0,
    eyesClosed: 0,
    yawns: 0,
    distractions: 0,
  });

  // History & Timeline
  const [alertHistory, setAlertHistory] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([
    { id: 1, time: "--:--:--", text: "System Initialized & Ready", type: "safe" }
  ]);
  const [snapshots, setSnapshots] = useState([]);

  // Settings
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    visualEnabled: true,
    criticalEnabled: true,
    volume: 0.8,
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSessionCompleteOpen, setIsSessionCompleteOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [alarmDetails, setAlarmDetails] = useState({ title: "", message: "" });
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureTimerRef = useRef(null);
  const sessionClockRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastVoiceTsRef = useRef(0);
  const lastLoggedEventRef = useRef("");
  const confSumRef = useRef(0);
  const confCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsTsRef = useRef(performance.now());
  const scoreRef = useRef(100);

  // Keep scoreRef synced
  useEffect(() => {
    scoreRef.current = currentScore;
  }, [currentScore]);

  // Audio Playback
  const playAlarmBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25 * settings.volume, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }, [settings.volume]);

  // Web Speech API Voice Alerts
  const speakVoiceAlert = useCallback((text) => {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.volume = settings.volume;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }, [settings.volume]);

  const evaluateVoiceAlert = useCallback((drowsiness, distraction, lvl) => {
    if (!settings.voiceEnabled) return;
    const now = performance.now();
    if (now - lastVoiceTsRef.current < CONFIG.voiceCooldownMs) return;

    let phrase = null;
    if (lvl === "CRITICAL") {
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
      lastVoiceTsRef.current = now;
    }
  }, [settings.voiceEnabled, speakVoiceAlert]);

  // Health Check Poller
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${CONFIG.apiUrl}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBackendOnline(true);
      if (data.models) {
        setModelStats({
          drowsiness: data.models.drowsiness?.num_classes ?? 4,
          distraction: data.models.distraction?.num_classes ?? 10,
        });
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, CONFIG.healthPollMs);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Timeline Event Helper
  const addTimelineEvent = useCallback((text, type = "safe") => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    setTimelineEvents(prev => [
      ...prev.slice(-12),
      { id: Date.now() + Math.random(), time: timeStr, text, type }
    ]);
  }, []);

  // Alert Event Recorder
  const recordAlert = useCallback((lvl, msg) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    const eventKey = `${lvl}-${msg}`;
    if (eventKey === lastLoggedEventRef.current) return;
    lastLoggedEventRef.current = eventKey;

    const newAlert = {
      id: Date.now(),
      time: timeStr,
      level: lvl,
      desc: msg || `${lvl} detected`,
      score: scoreRef.current,
    };

    setAlertHistory(prev => [newAlert, ...prev].slice(0, 50));
    addTimelineEvent(`${lvl} • ${msg || "Alert"}`, lvl === "CRITICAL" || lvl === "DROWSY" ? "danger" : "warn");
  }, [addTimelineEvent]);

  // Capture and Send Pipeline
  const captureAndSend = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    isProcessingRef.current = true;
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const aspect = video.videoHeight / video.videoWidth;
      const w = CONFIG.captureWidthPx;
      const h = Math.round(w * aspect);

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise(res =>
        canvas.toBlob(res, "image/jpeg", CONFIG.captureQuality)
      );
      if (!blob) return;

      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      const res = await fetch(`${CONFIG.apiUrl}/api/predict`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Inference failed");

      setBackendOnline(true);
      setLatencyMs(data.inference_time_ms);

      // FPS tracking
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastFpsTsRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFpsTsRef.current = now;
      }

      // Update detection data
      const { drowsiness, distraction, safety_level, safety_message, alarm } = data;
      setDrowsinessData(drowsiness);
      setDistractionData(distraction);
      setSafetyLevel(safety_level);
      setSafetyMessage(safety_message);
      setAlarmActive(alarm);

      // Safety Score Calculation
      let score = scoreRef.current;
      if (drowsiness?.is_drowsy) {
        if (drowsiness.prediction === "Closed") {
          const dur = Number(drowsiness.drowsy_elapsed_seconds || 0);
          score -= dur > 1.5 ? 6 : 3;
        } else if (drowsiness.prediction === "yawn") {
          score -= 2;
        }
      }
      if (distraction?.is_distracted) {
        const dur = Number(distraction.distracted_elapsed_seconds || 0);
        score -= dur > 2.0 ? 5 : 2;
      }
      if (!drowsiness?.is_drowsy && !distraction?.is_distracted && drowsiness?.face_detected) {
        score += 1.0;
      }
      score = Math.min(100, Math.max(10, Math.round(score)));
      setCurrentScore(score);
      setScoreHistory(prev => [...prev.slice(-29), score]);

      // Cumulative Stats
      const frames = Math.max(
        Number(drowsiness?.total_frames ?? 0),
        Number(distraction?.total_frames ?? 0)
      );
      setMaxFrames(prev => Math.max(prev, frames));
      if (drowsiness?.drowsy_events) setDrowsyEvents(prev => Math.max(prev, drowsiness.drowsy_events));
      if (distraction?.distracted_events) setDistractEvents(prev => Math.max(prev, distraction.distracted_events));
      if (drowsiness?.prediction === "yawn" && drowsiness?.confidence > 0.4) {
        setYawnEvents(prev => prev + 1);
      }

      // Confidence average
      const curConf = (Number(drowsiness?.confidence || 0) + Number(distraction?.confidence || 0)) / 2;
      if (curConf > 0) {
        confSumRef.current += curConf;
        confCountRef.current++;
        setAvgConfidence((confSumRef.current / confCountRef.current).toFixed(1));
      }

      // Donut counts
      setCounts(prev => ({
        eyesOpen: prev.eyesOpen + (drowsiness?.prediction === "Open" ? 1 : 0),
        eyesClosed: prev.eyesClosed + (drowsiness?.prediction === "Closed" ? 1 : 0),
        yawns: prev.yawns + (drowsiness?.prediction === "yawn" ? 1 : 0),
        distractions: prev.distractions + (distraction?.is_distracted ? 1 : 0),
      }));

      // Voice Alert
      evaluateVoiceAlert(drowsiness, distraction, safety_level);

      // Emergent Alarm
      if (alarm && settings.criticalEnabled) {
        setIsAlarmModalOpen(true);
        setAlarmDetails({
          title: `${safety_level} SAFETY ALERT`,
          message: safety_message || "Driver fatigue or distraction warning detected."
        });
        playAlarmBeep();
      }

      // Record alert in table
      if (safety_level === "DROWSY" || safety_level === "DISTRACTED" || safety_level === "CRITICAL") {
        recordAlert(safety_level, safety_message);
      }

    } catch (err) {
      console.error("Capture error:", err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [evaluateVoiceAlert, settings.criticalEnabled, playAlarmBeep, recordAlert]);

  // Start Camera
  const startCamera = async () => {
    if (monitoring) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMonitoring(true);
      setSafetyLevel("SAFE");
      setSafetyMessage("Driver is Attentive & Alert");
      setBannerDismissed(false);

      // Start Session Timer
      setSessionSeconds(0);
      sessionClockRef.current = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);

      // Start Capture Loop
      captureTimerRef.current = setInterval(captureAndSend, CONFIG.captureIntervalMs);
      addTimelineEvent("MONITORING ACTIVE", "safe");
    } catch (err) {
      console.error("Camera access error:", err);
      alert(`Camera access denied or unavailable: ${err.message}`);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (!monitoring && !streamRef.current) return;
    setMonitoring(false);

    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    if (sessionClockRef.current) {
      clearInterval(sessionClockRef.current);
      sessionClockRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setSafetyLevel("STANDBY");
    setSafetyMessage("Monitoring paused");
    addTimelineEvent("SESSION PAUSED", "warn");
    setIsSessionCompleteOpen(true);
  };

  // Capture Snapshot
  const captureSnapshot = () => {
    if (!monitoring || !canvasRef.current) {
      alert("Camera is not active. Click Start Monitoring first.");
      return;
    }
    try {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.85);
      const timeStr = new Date().toTimeString().split(" ")[0];
      setSnapshots(prev => [
        { id: Date.now(), time: timeStr, score: currentScore, src: dataUrl },
        ...prev.slice(0, 19)
      ]);
    } catch (e) {
      console.error("Snapshot error:", e);
    }
  };

  // Reset Session
  const resetSession = async () => {
    try {
      await fetch(`${CONFIG.apiUrl}/api/reset`, { method: "POST" });
    } catch (e) {
      console.warn("Reset API error:", e);
    }
    setCurrentScore(100);
    setScoreHistory([100, 100, 100, 100, 100]);
    setSafetyLevel("SAFE");
    setSafetyMessage("Driver is Attentive & Alert");
    setDrowsinessData(null);
    setDistractionData(null);
    setSessionSeconds(0);
    setMaxFrames(0);
    setDrowsyEvents(0);
    setYawnEvents(0);
    setDistractEvents(0);
    setAvgConfidence(null);
    setCounts({ eyesOpen: 0, eyesClosed: 0, yawns: 0, distractions: 0 });
    setAlertHistory([]);
    setSnapshots([]);
    setIsAlarmModalOpen(false);
    confSumRef.current = 0;
    confCountRef.current = 0;
    addTimelineEvent("System Initialized & Reset", "safe");
  };

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["Timestamp", "Severity", "Event", "SafetyScore"],
      ...alertHistory.map(a => [a.time, a.level, `"${a.desc}"`, a.score]),
    ];
    if (rows.length === 1) {
      rows.push([new Date().toLocaleTimeString(), "INFO", "Session Finished", currentScore]);
    }
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DriverGuard_Session_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const exportPDF = () => {
    setActiveTab("report");
    setTimeout(() => window.print(), 350);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (captureTimerRef.current) clearInterval(captureTimerRef.current);
      if (sessionClockRef.current) clearInterval(sessionClockRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
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
    alarmActive,
    drowsinessData,
    distractionData,
    sessionSeconds,
    maxFrames,
    drowsyEvents,
    yawnEvents,
    distractEvents,
    avgConfidence,
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
  };
}
