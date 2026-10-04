import React from "react";

export function Sidebar({
  currentPage,
  onNavigate,
  alertCount,
  backendOnline,
  cameraConnected,
  modelsActive,
  collapsed,
  onToggleCollapse,
}) {
  const navSections = [
    {
      title: "MONITORING",
      items: [
        { id: "dashboard",  label: "Dashboard",       icon: "home"      },
        { id: "live",       label: "Live Monitor",    icon: "camera"    },
        { id: "analytics",  label: "Analytics",       icon: "chart"     },
        { id: "alerts",     label: "Alerts",          icon: "bell", badge: alertCount },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { id: "reports",  label: "Session Reports", icon: "file"  },
        { id: "history",  label: "History",         icon: "clock" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: "settings" },
      ],
    },
  ];

  const icons = {
    home: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    camera: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
    chart: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
    bell: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    file: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    clock: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  };

  return (
    <aside className={`sb-root ${collapsed ? "sb-collapsed" : ""}`}>
      <div className="sb-inner">

        {/* ── Brand ──────────────────────────────────────────── */}
        <div className="sb-brand">
          <div className="sb-shield-logo">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 3L5 7.5V15C5 22.2 9.7 28 16 29.5C22.3 28 27 22.2 27 15V7.5L16 3Z"
                stroke="#0D9488"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#0D9488"
                fillOpacity="0.1"
              />
              <path
                d="M16 6.5L8.5 10V15C8.5 20.2 11.7 24.8 16 26.2C20.3 24.8 23.5 20.2 23.5 15V10L16 6.5Z"
                fill="#0D9488"
                fillOpacity="0.85"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-brand-text">
              <span className="sb-brand-name">DriverGuard</span>
              <span className="sb-brand-badge">AI MONITORING</span>
            </div>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────────────── */}
        <nav className="sb-nav">
          {navSections.map((section, si) => (
            <div key={si} className="sb-section">
              {!collapsed && (
                <div className="sb-section-title">{section.title}</div>
              )}
              {section.items.map((item) => {
                const active = currentPage === item.id;
                return (
                  <div key={item.id} className="sb-item-wrapper">
                    {active && <span className="sb-active-indicator" />}
                    <button
                      className={`sb-item ${active ? "sb-item-active" : ""}`}
                      onClick={() => onNavigate(item.id)}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="sb-item-icon">{icons[item.icon]}</span>
                      {!collapsed && (
                        <>
                          <span className="sb-item-label">{item.label}</span>
                          {item.badge > 0 && (
                            <span className="sb-item-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── System Status ───────────────────────────────────── */}
        <div className="sb-footer-card">
          {!collapsed ? (
            <>
              <div className="sb-footer-header">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
                <span>SYSTEM STATUS</span>
              </div>
              <div className="sb-status-rows">
                <div className="sb-status-row">
                  <span className="sb-status-dot sb-dot-green" />
                  <span className="sb-status-name">Backend Online</span>
                </div>
                <div className="sb-status-row">
                  <span className="sb-status-dot sb-dot-green" />
                  <span className="sb-status-name">Camera Ready</span>
                </div>
                <div className="sb-status-row">
                  <span className="sb-status-dot sb-dot-green" />
                  <span className="sb-status-name">AI Models Active</span>
                </div>
              </div>
            </>
          ) : (
            <div className="sb-collapsed-dots">
              <span className="sb-status-dot sb-dot-green" />
              <span className="sb-status-dot sb-dot-green" />
              <span className="sb-status-dot sb-dot-green" />
            </div>
          )}
        </div>

        {/* Optional Collapse toggle if needed */}
        {onToggleCollapse && (
          <button
            className="sb-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand" : "Collapse"}
            style={{ display: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
            </svg>
          </button>
        )}

      </div>
    </aside>
  );
}
