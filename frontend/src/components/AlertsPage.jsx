import React from "react";
import { AlertsTab } from "./AlertsTab";

export function AlertsPage({
  alertHistory,
  onClear,
  onOpenGallery,
  snapshotCount,
}) {
  return (
    <div className="page-alerts">
      <AlertsTab
        alertHistory={alertHistory}
        onClear={onClear}
        onOpenGallery={onOpenGallery}
        snapshotCount={snapshotCount}
      />
    </div>
  );
}
