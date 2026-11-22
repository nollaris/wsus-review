import { ServerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { wsusServers, type WsusServer } from "@/data/wsus-sample";

function getSyncBadgeVariant(
  status: WsusServer["syncStatus"]
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Succeeded":
      return "default";
    case "Syncing":
      return "secondary";
    case "Warning":
      return "destructive";
  }
}

export function WsusServersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>WSUS Server Status</CardTitle>
        <CardDescription>
          Synchronization health, content storage, and client load per server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {wsusServers.map((server) => {
            const storagePct = Math.round(
              (server.storageUsedGb / server.storageTotalGb) * 100
            );
            return (
              <div
                key={server.id}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{server.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {server.role} · {server.ipAddress}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSyncBadgeVariant(server.syncStatus)}>
                    {server.syncStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Last Sync: </span>
                    <span className="font-medium">{server.lastSync}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clients: </span>
                    <span className="font-medium">
                      {server.connectedClients}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Content Storage
                    </span>
                    <span className="font-medium">
                      {server.storageUsedGb} / {server.storageTotalGb} GB (
                      {storagePct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${storagePct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
