import type { Metadata } from "next";

import { WsusLogsView } from "@/components/wsus/wsus-logs-view";

export const metadata: Metadata = {
  title: "Logs",
  description: "WSUS synchronization, patch approval, and client event logs",
};

export default function LogsPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">System Logs</h1>
        <p className="text-sm text-muted-foreground">
          Review WSUS synchronization events, patch approval history, and client
          installation errors.
        </p>
      </div>

      <WsusLogsView />
    </div>
  );
}
