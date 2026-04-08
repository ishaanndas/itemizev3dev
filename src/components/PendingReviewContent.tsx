import { useState } from "react";
import TopBar from "./TopBar";
import PendingReviewTable from "./PendingReviewTable";

export default function PendingReviewContent() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <TopBar />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Review</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve documents awaiting your attention
              </p>
            </div>
          </div>

          <PendingReviewTable />
        </div>
      </div>
    </div>
  );
}
