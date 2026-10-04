import React from "react";

export function AnalyticsTab({
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
  // Donut chart calculations (Circumference of r=38 is ~238.76)
  const total = counts.eyesOpen + counts.eyesClosed + counts.yawns + counts.distractions;
  const C = 238.76;
  const pOpen = total > 0 ? (counts.eyesOpen / total) * C : 0;
  const pYawn = total > 0 ? (counts.yawns / total) * C : 0;
  const pClosed = total > 0 ? (counts.eyesClosed / total) * C : 0;
  const pDist = total > 0 ? (counts.distractions / total) * C : 0;

  // Trend line calculation
  const pts = scoreHistory && scoreHistory.length >= 2 ? scoreHistory : [100, 100];
  const w = 400;
  const h = 100;
  const dx = w / (pts.length - 1);

  let pathD = `M 0 ${Math.round(h - (pts[0] / 100) * (h - 20) - 10)}`;
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(i * dx);
    const y = Math.round(h - (pts[i] / 100) * (h - 20) - 10);
    pathD += ` L ${x} ${y}`;
  }
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  const drowsyProbs = drowsinessData?.probabilities || {};
  const distractTop = distractionData?.top_classes || [];

  return (
    <div className="analytics-section-wrap">
      <div className="section-title-bar">
        <div className="section-title-left">
          <span className="section-icon-badge">📊</span>
          <div>
            <h2>Real-Time Fleet Analytics &amp; Behavior Insights</h2>
            <p className="section-sub">
              Cumulative inference metrics, detection distribution, and temporal alertness tracking
            </p>
          </div>
        </div>
        <span className="badge-tag">Telemetry Analytics</span>
      </div>

      <div className="analytics-content-flow">
        {/* 4 Large Overview Metric Tiles */}
        <div className="analytics-tiles-grid">
          <div className="ana-tile">
            <span className="ana-tile-label">FRAMES ANALYSED</span>
            <strong className="ana-tile-val" id="statFrames">
              {maxFrames.toLocaleString()}
            </strong>
            <span className="ana-tile-sub">Real-time inference stream</span>
          </div>
          <div className="ana-tile tile-drowsy">
            <span className="ana-tile-label">DROWSY EVENTS</span>
            <strong className="ana-tile-val" id="statDrowsyEvents">
              {drowsyEvents}
            </strong>
            <span className="ana-tile-sub">Eyes closed &gt; threshold</span>
          </div>
          <div className="ana-tile tile-yawn">
            <span className="ana-tile-label">YAWN EVENTS</span>
            <strong className="ana-tile-val" id="statYawnEvents">
              {yawnEvents}
            </strong>
            <span className="ana-tile-sub">Yawn behavior episodes</span>
          </div>
          <div className="ana-tile tile-distract">
            <span className="ana-tile-label">DISTRACTION EVENTS</span>
            <strong className="ana-tile-val" id="statDistractEvents">
              {distractEvents}
            </strong>
            <span className="ana-tile-sub">Inattentive / off-road instances</span>
          </div>
        </div>

        {/* 2 Large Side-by-Side Analytics Cards */}
        <div className="analytics-main-grid">
          {/* Card 1: Detection Distribution Donut Chart */}
          <div className="panel">
            <div className="panel-header">
              <h2>DETECTION DISTRIBUTION</h2>
              <div className="chart-legend-row">
                <span className="legend-item">
                  <span className="legend-dot dot-safe"></span>Open
                </span>
                <span className="legend-item">
                  <span className="legend-dot dot-danger"></span>Closed
                </span>
                <span className="legend-item">
                  <span className="legend-dot dot-warn"></span>Yawn
                </span>
                <span className="legend-item">
                  <span className="legend-dot dot-distract"></span>Distract
                </span>
              </div>
            </div>
            <div className="donut-chart-card-body">
              <div className="donut-chart-wrap">
                <svg className="donut-svg-large" viewBox="0 0 100 100" id="donutChartSvg">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="donut-bg"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                    fill="none"
                  />
                  {total > 0 ? (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="donut-seg seg-safe"
                        stroke="#16A34A"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${pOpen} ${C}`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="donut-seg seg-warn"
                        stroke="#F59E0B"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${pYawn} ${C}`}
                        strokeDashoffset={`-${pOpen}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="donut-seg seg-danger"
                        stroke="#DC2626"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${pClosed} ${C}`}
                        strokeDashoffset={`-${pOpen + pYawn}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="donut-seg seg-distract"
                        stroke="#F97316"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${pDist} ${C}`}
                        strokeDashoffset={`-${pOpen + pYawn + pClosed}`}
                      />
                    </>
                  ) : (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#E2E8F0"
                      strokeWidth="12"
                      fill="none"
                    />
                  )}
                </svg>
              </div>
              <div className="donut-legend-counts-large">
                <div className="cnt-card safe">
                  <span>Eyes Open</span>
                  <strong id="cntEyesOpen">{counts.eyesOpen}</strong>
                </div>
                <div className="cnt-card danger">
                  <span>Eyes Closed</span>
                  <strong id="cntEyesClosed">{counts.eyesClosed}</strong>
                </div>
                <div className="cnt-card warn">
                  <span>Yawns</span>
                  <strong id="cntYawns">{counts.yawns}</strong>
                </div>
                <div className="cnt-card distract">
                  <span>Distractions</span>
                  <strong id="cntDistractions">{counts.distractions}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Driver Safety Score Trend */}
          <div className="panel">
            <div className="panel-header">
              <h2>DRIVER SAFETY TREND</h2>
              <span className="hdr-tag" id="trendCurrentScoreTag">
                Score: {currentScore}
              </span>
            </div>
            <div className="trend-card-body">
              <p className="trend-sub">
                Temporal alertness score tracking over continuous operational window.
              </p>
              <div className="trend-canvas-wrap-large">
                <svg
                  className="trend-svg"
                  id="trendLineSvg"
                  preserveAspectRatio="none"
                  viewBox="0 0 400 100"
                >
                  <defs>
                    <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path id="trendArea" d={areaD} fill="url(#trendGrad)" />
                  <path
                    id="trendLine"
                    d={pathD}
                    stroke="#F97316"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="trend-footer-tags-large">
                <span>Session Start</span>
                <span>Moving Telemetry Window</span>
                <span>Current: {currentScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Event Timeline Rail */}
        <div className="panel timeline-panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <span className="pulse-indicator"></span>
              <h2>SESSION EVENT TIMELINE</h2>
            </div>
            <span className="hdr-tag">Live Stream</span>
          </div>
          <div className="cc-timeline-strip">
            <div className="timeline-label-col">
              <span className="live-dot-pulse"></span>
              <span>EVENTS</span>
            </div>
            <div className="timeline-rail" id="timelineRail">
              {timelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`timeline-event-chip chip-${evt.type || "safe"}`}
                >
                  <span className="event-time">{evt.time}</span>
                  <span className="event-desc">{evt.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Model Class Bars */}
        <div className="analytics-sub-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Drowsiness Classification (MobileNetV2)</h2>
            </div>
            <div className="analytics-card-content">
              <div className="analytics-stat-bars">
                {["Open", "Closed", "no_yawn", "yawn"].map((cls) => {
                  const val = Number((drowsyProbs[cls] || 0) * 100).toFixed(1);
                  const isBad = cls === "Closed" || cls === "yawn";
                  return (
                    <div key={cls} className="prob-item" style={{ marginBottom: "10px" }}>
                      <div className="prob-row">
                        <span>{cls.replace("_", " ").toUpperCase()}</span>
                        <strong>{val}%</strong>
                      </div>
                      <div className="prog-track">
                        <div
                          className={`prog-fill ${isBad ? "drowsy-fill" : "alert-fill"}`}
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Distraction Behavior Breakdown (ResNet-18)</h2>
            </div>
            <div className="analytics-card-content">
              <div className="analytics-stat-bars">
                {distractTop.length > 0 ? (
                  distractTop.map((item, i) => (
                    <div
                      key={i}
                      className="prob-item"
                      style={{ marginBottom: "10px" }}
                    >
                      <div className="prob-row">
                        <span>{item.class_name}</span>
                        <strong>{Number(item.confidence || 0).toFixed(1)}%</strong>
                      </div>
                      <div className="prog-track">
                        <div
                          className="prog-fill warn-fill"
                          style={{ width: `${Math.min(100, item.confidence || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-empty">Waiting for camera inference stream…</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
