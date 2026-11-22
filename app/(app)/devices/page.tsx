import type { Metadata } from "next";

import { WsusDeviceUpdatesView } from "@/components/wsus/wsus-device-updates-view";

export const metadata: Metadata = {
  title: "Devices",
  description: "Client update status per device",
};

export default function DevicesPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Device Update Status
        </h1>
        <p className="text-sm text-muted-foreground">
          Review patch compliance and individual KB update status for each
          managed client device.
        </p>
      </div>

      <WsusDeviceUpdatesView />
    </div>
  );
}
