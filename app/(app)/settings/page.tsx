import type { Metadata } from "next";

import { WsusSettingsView } from "@/components/wsus/wsus-settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "WSUS Review application and policy settings",
};

export default function SettingsPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage appearance, synchronization defaults, patch approval policies,
          and your session.
        </p>
      </div>

      <WsusSettingsView />
    </div>
  );
}
