import React from "react";

export function HistoryPage() {
  // Mock history data - in a real app this would come from backend/localStorage
  const sessions = [
    { id: 1, date: "Today", duration: "24:32", safetyScore: 82, events: 14 },
    { id: 2, date: "Yesterday", duration: "31:17", safetyScore: 91, events: 8 },
    { id: 3, date: "2 days ago", duration: "42:05", safetyScore: 76, events: 22 },
    { id: 4, date: "3 days ago", duration: "18:43", safetyScore: 94, events: 4 },
    { id: 5, date: "4 days ago", duration: "29:12", safetyScore: 88, events: 11 },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return "#16A34A";
    if (score >= 75) return "#F97316";
    return "#DC2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  return (
    <div className="page-history">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Session History</h1>
          <p className="page-subtitle">Previous monitoring sessions</p>
        </div>
      </div>

      {/* History List */}
      <div className="history-list">
        {sessions.map((session) => (
          <div key={session.id} className="history-item">
            <div className="history-item-date">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{session.date}</span>
            </div>
            
            <div className="history-item-content">
              <div className="history-metric">
                <div className="history-metric-label">Duration</div>
                <div className="history-metric-value">{session.duration}</div>
              </div>
              
              <div className="history-metric">
                <div className="history-metric-label">Safety Score</div>
                <div className="history-metric-value" style={{ color: getScoreColor(session.safetyScore) }}>
                  {session.safetyScore}
                  <span className="history-score-label">{getScoreLabel(session.safetyScore)}</span>
                </div>
              </div>
              
              <div className="history-metric">
                <div className="history-metric-label">Events</div>
                <div className="history-metric-value">{session.events}</div>
              </div>
            </div>

            <button className="history-item-action" title="View Details">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3>No Session History</h3>
          <p>Your monitoring sessions will appear here</p>
        </div>
      )}
    </div>
  );
}
