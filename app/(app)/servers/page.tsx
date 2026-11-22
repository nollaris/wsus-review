import type { Metadata } from "next";

import { WsusServerSetupView } from "@/components/wsus/wsus-server-setup-view";

export const metadata: Metadata = {
  title: "Server Setup",
  description: "Configure WSUS server connections and sync schedules",
};

export default function ServersPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          WSUS Server Setup
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage upstream and downstream WSUS server connections, SSL settings,
          and synchronization schedules.
        </p>
      </div>

      <WsusServerSetupView />
    </div>
  );
}
