import React from "react";

export function Sidebar({ 
  currentPage, 
  onNavigate, 
  alertCount, 
  backendOnline, 
  cameraConnected, 
  modelsActive,
  collapsed,
  onToggleCollapse 
}) {
  const navSections = [
    {
      title: "MONITORING",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "home" },
        { id: "live", label: "Live Monitor", icon: "camera" },
        { id: "analytics", label: "Analytics", icon: "chart" },
        { id: "alerts", label: "Alerts", icon: "bell", badge: alertCount },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { id: "reports", label: "Session Reports", icon: "file-text" },
        { id: "history", label: "History", icon: "clock" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: "settings" },
      ],
    },
  ];

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      camera: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
      chart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      bell: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      "file-text": (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
      clock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
        </svg>
      ),
      "help-circle": (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    };
    return icons[iconName] || icons.home;
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-content">
        {/* Branding */}
        <div className="sidebar-brand">
          <div className="brand-icon-shield">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-name-row">
                <h1 className="brand-name">DriverGuard</h1>
              </div>
              <div className="brand-subtitle">
                <span className="ai-badge">AI MONITORING</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="nav-section">
              {!collapsed && <div className="nav-section-title">{section.title}</div>}
              <div className="nav-items">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="nav-item-content">
                      <span className="nav-item-icon">{getIcon(item.icon)}</span>
                      {!collapsed && (
                        <>
                          <span className="nav-item-label">{item.label}</span>
                          {item.badge > 0 && (
                            <span className="nav-item-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status Footer */}
        <div className="sidebar-footer">
          {!collapsed && (
            <>
              <div className="system-status-title">SYSTEM STATUS</div>
              <div className="status-items">
                <div className={`status-item ${backendOnline ? "online" : "offline"}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">Backend {backendOnline ? "Online" : "Offline"}</span>
                </div>
                <div className={`status-item ${cameraConnected ? "online" : "offline"}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">Camera {cameraConnected ? "Connected" : "Ready"}</span>
                </div>
                <div className={`status-item ${modelsActive ? "online" : "offline"}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">AI Models {modelsActive ? "Active" : "Ready"}</span>
                </div>
              </div>
            </>
          )}
          {collapsed && (
            <div className="status-items-collapsed">
              <div className={`status-dot-collapsed ${backendOnline ? "online" : "offline"}`} title="Backend Status"></div>
              <div className={`status-dot-collapsed ${cameraConnected ? "online" : "offline"}`} title="Camera Status"></div>
              <div className={`status-dot-collapsed ${modelsActive ? "online" : "offline"}`} title="AI Models"></div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <path d="m9 18 6-6-6-6" />
            ) : (
              <path d="m15 18-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
}
