import React from "react";

// Subtle corner decorative wave matching the dashboard cards
function CornerWave({ color = "#007C83", opacity = 0.12 }) {
  return (
    <svg
      className="db-card-corner-wave"
      viewBox="0 0 140 70"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 70 C40 40 80 60 140 30 L140 70 Z"
        fill={color}
        fillOpacity={opacity}
      />
      <path
        d="M20 70 C60 50 100 65 140 45 L140 70 Z"
        fill={color}
        fillOpacity={opacity * 0.7}
      />
    </svg>
  );
}

export function AnalyticsTab({
  maxFrames = 0,
  drowsyEvents = 0,
  yawnEvents = 0,
  distractEvents = 0,
  currentScore = 100,
  scoreHistory = [100, 100],
  counts = { eyesOpen: 0, eyesClosed: 0, yawns: 0, distractions: 0 },
  timelineEvents = [],
  drowsinessData,
  distractionData,
}) {
  const countsSafe = counts || { eyesOpen: 0, eyesClosed: 0, yawns: 0, distractions: 0 };
  const total =
    (countsSafe.eyesOpen || 0) +
    (countsSafe.eyesClosed || 0) +
    (countsSafe.yawns || 0) +
    (countsSafe.distractions || 0);

  // Circumference of r=38 circle is 2 * PI * 38 = 238.76
  const C = 238.76;
  const pOpen = total > 0 ? ((countsSafe.eyesOpen || 0) / total) * C : 0;
  const pClosed = total > 0 ? ((countsSafe.eyesClosed || 0) / total) * C : 0;
  const pYawn = total > 0 ? ((countsSafe.yawns || 0) / total) * C : 0;
  const pDist = total > 0 ? ((countsSafe.distractions || 0) / total) * C : 0;

  // Trend line coordinates calculation with larger height (130px)
  const pts = scoreHistory && scoreHistory.length >= 2 ? scoreHistory : [100, 100];
  const w = 420;
  const h = 130;
  const dx = w / (pts.length - 1);

  let pathD = `M 0 ${Math.round(h - (pts[0] / 100) * (h - 26) - 12)}`;
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(i * dx);
    const y = Math.round(h - (pts[i] / 100) * (h - 26) - 12);
    pathD += ` L ${x} ${y}`;
  }
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  const drowsyProbs = drowsinessData?.probabilities || {};
  const distractTop = distractionData?.top_classes || [];

  return (
    <div className="ap-page">

      {/* ── Page Header with Multi-Color Analytics Title ──────── */}
      <div className="ap-page-header">
        <div className="ap-header-left">
          <div className="ap-header-icon-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
          </div>
          <div>
            <h1 className="ap-title ap-title-multicolor">Analytics</h1>
            <p className="ap-subtitle">Session statistics and trends</p>
          </div>
        </div>
        <div className="ap-header-right">
          <span className="ap-telemetry-tag">
            <span className="ap-pulse-dot" />
            TELEMETRY ANALYTICS
          </span>
        </div>
      </div>

      {/* ── Analytics Intro Card (Larger & Spacious) ───────────── */}
      <div className="ap-intro-card">
        <div className="ap-intro-left-indicator" />
        <div className="ap-intro-content">
          <div className="ap-intro-icon-circle" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="12" width="4" height="8" rx="1" fill="#00A6A6" />
              <rect x="10" y="8" width="4" height="12" rx="1" fill="#007C83" />
              <rect x="17" y="4" width="4" height="16" rx="1" fill="#005F63" />
            </svg>
          </div>
          <div className="ap-intro-text">
            <div className="ap-intro-title">REAL-TIME DRIVER ANALYTICS</div>
            <div className="ap-intro-subtitle">Session performance and safety insights</div>
          </div>
        </div>
        <div className="ap-intro-wave" aria-hidden="true">
          <svg viewBox="0 0 450 60" preserveAspectRatio="none">
            <path
              d="M0 40 C100 15 220 55 330 25 C390 10 420 30 450 15 L450 60 L0 60 Z"
              fill="#00A6A6"
              fillOpacity="0.08"
            />
            <path
              d="M50 45 C150 20 270 50 380 20 L450 30 L450 60 L50 60 Z"
              fill="#007C83"
              fillOpacity="0.05"
            />
          </svg>
        </div>
      </div>

      {/* ── 4 KPI Cards Grid (Larger & Bolder) ────────────────── */}
      <div className="ap-kpi-grid">
        {/* Card 1: FRAMES ANALYSED */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-peacock" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <span className="ap-kpi-label">FRAMES ANALYSED</span>
          </div>
          <div className="ap-kpi-val ap-val-navy">{maxFrames.toLocaleString()}</div>
          <div className="ap-kpi-sub">Real-time inference stream</div>
          <CornerWave color="#007C83" opacity={0.12} />
        </div>

        {/* Card 2: DROWSY EVENTS */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-red" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="ap-kpi-label">DROWSY EVENTS</span>
          </div>
          <div className="ap-kpi-val ap-val-red">{drowsyEvents}</div>
          <div className="ap-kpi-sub">Eyes closed → threshold</div>
          <CornerWave color="#DC2626" opacity={0.10} />
        </div>

        {/* Card 3: YAWN EVENTS */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-orange" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <span className="ap-kpi-label">YAWN EVENTS</span>
          </div>
          <div className="ap-kpi-val ap-val-orange">{yawnEvents}</div>
          <div className="ap-kpi-sub">Yawn behavior episodes</div>
          <CornerWave color="#F59E0B" opacity={0.10} />
        </div>

        {/* Card 4: DISTRACTION EVENTS */}
        <div className="ap-kpi-card">
          <div className="ap-kpi-header">
            <div className="ap-kpi-icon ap-icon-teal" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="ap-kpi-label">DISTRACTION EVENTS</span>
          </div>
          <div className="ap-kpi-val ap-val-teal">{distractEvents}</div>
          <div className="ap-kpi-sub">Inattentive / off-road instances</div>
          <CornerWave color="#00A6A6" opacity={0.10} />
        </div>
      </div>

      {/* ── Middle Row: Detection Distribution + Safety Trend ─── */}
      <div className="ap-mid-grid">

        {/* Card: Detection Distribution (Bigger & Spacious) */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12A9 9 0 0 0 12 3v9h9z" />
                  <path d="M10.5 3.08A9 9 0 1 0 20.92 13.5H10.5V3.08z" opacity="0.6" />
                </svg>
              </span>
              <span className="ap-card-title-multicolor">Detection Distribution</span>
            </h2>
            <div className="ap-donut-legend-header">
              <span><span className="ap-legend-dot" style={{ background: "#16A34A" }} />Open</span>
              <span><span className="ap-legend-dot" style={{ background: "#DC2626" }} />Closed</span>
              <span><span className="ap-legend-dot" style={{ background: "#F59E0B" }} />Yawn</span>
              <span><span className="ap-legend-dot" style={{ background: "#007C83" }} />Distract</span>
            </div>
          </div>

          <div className="ap-donut-body">
            <div className="ap-donut-chart-wrap">
              <svg className="ap-donut-svg" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#EEF2F6"
                  strokeWidth="11"
                  fill="none"
                />
                {total > 0 ? (
                  <>
                    {/* Open Segment: Green #16A34A */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#16A34A"
                      strokeWidth="11"
                      fill="none"
                      strokeDasharray={`${pOpen} ${C}`}
                      strokeDashoffset="0"
                    />
                    {/* Closed Segment: Red #DC2626 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#DC2626"
                      strokeWidth="11"
                      fill="none"
                      strokeDasharray={`${pClosed} ${C}`}
                      strokeDashoffset={`-${pOpen}`}
                    />
                    {/* Yawn Segment: Orange #F59E0B */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F59E0B"
                      strokeWidth="11"
                      fill="none"
                      strokeDasharray={`${pYawn} ${C}`}
                      strokeDashoffset={`-${pOpen + pClosed}`}
                    />
                    {/* Distract Segment: Peacock Blue #007C83 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#007C83"
                      strokeWidth="11"
                      fill="none"
                      strokeDasharray={`${pDist} ${C}`}
                      strokeDashoffset={`-${pOpen + pClosed + pYawn}`}
                    />
                  </>
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#E2E8F0"
                    strokeWidth="11"
                    fill="none"
                  />
                )}
                {/* Center Total Text */}
                <g className="ap-donut-center-text">
                  <text x="50" y="47" textAnchor="middle" className="ap-donut-center-num">
                    {total}
                  </text>
                  <text x="50" y="61" textAnchor="middle" className="ap-donut-center-lbl">
                    Total
                  </text>
                </g>
              </svg>
            </div>

            {/* 4 Stat Tiles Beside Donut */}
            <div className="ap-stats-grid">
              <div className="ap-stat-tile">
                <div className="ap-stat-info">
                  <span className="ap-legend-dot" style={{ background: "#16A34A" }} />
                  <span className="ap-stat-label">Eyes Open</span>
                </div>
                <strong className="ap-stat-num">{countsSafe.eyesOpen || 0}</strong>
              </div>

              <div className="ap-stat-tile">
                <div className="ap-stat-info">
                  <span className="ap-legend-dot" style={{ background: "#DC2626" }} />
                  <span className="ap-stat-label">Eyes Closed</span>
                </div>
                <strong className="ap-stat-num">{countsSafe.eyesClosed || 0}</strong>
              </div>

              <div className="ap-stat-tile">
                <div className="ap-stat-info">
                  <span className="ap-legend-dot" style={{ background: "#F59E0B" }} />
                  <span className="ap-stat-label">Yawns</span>
                </div>
                <strong className="ap-stat-num">{countsSafe.yawns || 0}</strong>
              </div>

              <div className="ap-stat-tile">
                <div className="ap-stat-info">
                  <span className="ap-legend-dot" style={{ background: "#007C83" }} />
                  <span className="ap-stat-label">Distractions</span>
                </div>
                <strong className="ap-stat-num">{countsSafe.distractions || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Driver Safety Trend (Bigger & Taller Canvas) */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </span>
              <span className="ap-card-title-multicolor">Driver Safety Trend</span>
            </h2>
            <span className="ap-card-badge">Score: {currentScore}</span>
          </div>

          <p className="ap-trend-sub">
            Temporal alertness score tracking over continuous operational window.
          </p>

          <div className="ap-trend-svg-wrap">
            <svg
              className="ap-trend-svg"
              viewBox="0 0 420 130"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="apTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007C83" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00A6A6" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="25" x2="420" y2="25" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="420" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="95" x2="420" y2="95" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

              {/* Area & Line */}
              <path d={areaD} fill="url(#apTrendGrad)" />
              <path
                d={pathD}
                stroke="#007C83"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="ap-trend-footer">
            <span>Session Start</span>
            <span>Moving Telemetry Window</span>
            <span>Current: {currentScore}/100</span>
          </div>
        </div>
      </div>

      {/* ── Session Event Timeline (Bigger Rail) ────────────────── */}
      <div className="ap-timeline-card">
        <div className="ap-timeline-header">
          <h2 className="ap-timeline-title">
            <span style={{ color: "#007C83" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className="ap-card-title-multicolor">Session Event Timeline</span>
          </h2>
          <span className="ap-telemetry-tag" style={{ padding: "5px 12px", fontSize: "11.5px" }}>
            <span className="ap-pulse-dot" />
            Live Stream
          </span>
        </div>

        <div className="ap-timeline-rail-wrap">
          <div className="ap-timeline-events-pill">
            <span className="ap-pulse-dot" style={{ width: "6px", height: "6px" }} />
            EVENTS
          </div>

          <div className="ap-timeline-rail">
            {timelineEvents && timelineEvents.length > 0 ? (
              timelineEvents.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className={`ap-event-chip chip-${evt.type || "safe"}`}
                >
                  <span className="ap-event-time">{evt.time}</span>
                  <span>{evt.text}</span>
                </div>
              ))
            ) : (
              <div className="ap-event-chip chip-safe">
                <span className="ap-event-time">--:--:--</span>
                <span>System Initialized &amp; Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Drowsiness + Distraction Breakdown ─────── */}
      <div className="ap-bottom-grid">

        {/* Drowsiness Classification */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              Drowsiness Classification (MobileNetV2)
            </h2>
          </div>

          <div className="ap-prob-list">
            {[
              { key: "Open",    label: "OPEN",    colorClass: "ap-fill-green"  },
              { key: "Closed",  label: "CLOSED",  colorClass: "ap-fill-red"    },
              { key: "no_yawn", label: "NO YAWN", colorClass: "ap-fill-teal"   },
              { key: "yawn",    label: "YAWN",    colorClass: "ap-fill-orange" },
            ].map(({ key, label, colorClass }) => {
              const raw = drowsyProbs[key] ?? 0;
              const pct = Number(raw * 100).toFixed(1);
              return (
                <div key={key} className="ap-prob-item">
                  <div className="ap-prob-header">
                    <span>{label}</span>
                    <span className="ap-prob-pct">{pct}%</span>
                  </div>
                  <div className="ap-prob-track">
                    <div
                      className={`ap-prob-fill ${colorClass}`}
                      style={{ width: `${Math.min(100, Math.max(0, Number(pct)))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distraction Behavior Breakdown */}
        <div className="ap-card">
          <div className="ap-card-header">
            <h2 className="ap-card-title">
              <span className="ap-card-title-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              Distraction Behavior Breakdown (ResNet-18)
            </h2>
          </div>

          <div className="ap-prob-list">
            {distractTop && distractTop.length > 0 ? (
              distractTop.map((item, i) => {
                const conf = Number(item.confidence || 0).toFixed(1);
                return (
                  <div key={i} className="ap-prob-item">
                    <div className="ap-prob-header">
                      <span>{item.class_name}</span>
                      <span className="ap-prob-pct">{conf}%</span>
                    </div>
                    <div className="ap-prob-track">
                      <div
                        className="ap-prob-fill ap-fill-teal"
                        style={{ width: `${Math.min(100, Math.max(0, Number(conf)))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ap-empty-state">
                <div className="ap-empty-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                </div>
                <span>Waiting for camera detection...</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
