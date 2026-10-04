import React from "react";

export function AlertsTab({ alertHistory, onClear, onOpenGallery, snapshotCount }) {
  return (
    <div className="tab-page active" id="tabAlerts">
      <div className="tab-page-container">
        <div className="panel full-height-panel">
          <div className="panel-header">
            <div className="panel-title">
              <h2>Complete Session Alert &amp; Event Log</h2>
              <span className="hdr-tag">{alertHistory.length} Recorded Events</span>
            </div>
            <div className="header-badges">
              {snapshotCount > 0 && (
                <button className="btn btn-secondary btn-ctrl" onClick={onOpenGallery}>
                  View Snapshots ({snapshotCount})
                </button>
              )}
              <button
                className="btn btn-secondary btn-ctrl"
                onClick={onClear}
                disabled={alertHistory.length === 0}
              >
                Clear Log
              </button>
            </div>
          </div>

          <div className="full-alert-table-wrap">
            <table className="cc-table" id="fullAlertsTable">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Detection Type &amp; Details</th>
                  <th>Driver Safety Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="fullAlertsTbody">
                {alertHistory.length > 0 ? (
                  alertHistory.map((item) => {
                    const isCrit = item.level === "CRITICAL" || item.level === "DROWSY";
                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="table-timestamp">{item.time}</span>
                        </td>
                        <td>
                          <span className={`history-tag ${isCrit ? "tag-danger" : "tag-warn"}`}>
                            {item.level}
                          </span>
                        </td>
                        <td>
                          <strong>{item.desc}</strong>
                        </td>
                        <td>
                          <span
                            className="table-score-badge"
                            style={{
                              color: item.score < 50 ? "#DC2626" : item.score < 75 ? "#F59E0B" : "#16A34A",
                              fontWeight: 700,
                            }}
                          >
                            {item.score} / 100
                          </span>
                        </td>
                        <td>
                          <span className="table-status-pill">Logged</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="table-empty">
                      No alerts recorded yet in this session. Driver condition is safe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
