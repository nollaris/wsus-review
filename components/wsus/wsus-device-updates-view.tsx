"use client";

import * as React from "react";
import { MonitorIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  wsusClients,
  wsusServers,
  type ClientComplianceStatus,
  type WsusClient,
  type WsusDeviceUpdate,
} from "@/data/wsus-sample";

const clientStatusMeta: Record<
  ClientComplianceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  compliant: { label: "Compliant", variant: "default" },
  needed: { label: "Updates Needed", variant: "secondary" },
  pending_reboot: { label: "Pending Reboot", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
  offline: { label: "Offline", variant: "outline" },
};

const updateStatusMeta: Record<
  WsusDeviceUpdate["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  Installed: "default",
  Needed: "secondary",
  "Pending Reboot": "outline",
  Failed: "destructive",
};

export function WsusDeviceUpdatesView() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [serverFilter, setServerFilter] = React.useState("all");
  const [selectedDevice, setSelectedDevice] = React.useState<WsusClient | null>(
    null
  );

  const filteredDevices = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return wsusClients.filter((client) => {
      if (statusFilter !== "all" && client.status !== statusFilter) {
        return false;
      }
      if (serverFilter !== "all" && client.serverName !== serverFilter) {
        return false;
      }
      if (!normalized) return true;

      const matchesUpdate = client.updates.some(
        (u) =>
          u.kb.toLowerCase().includes(normalized) ||
          u.title.toLowerCase().includes(normalized)
      );

      return (
        client.hostname.toLowerCase().includes(normalized) ||
        client.ipAddress.toLowerCase().includes(normalized) ||
        client.targetGroup.toLowerCase().includes(normalized) ||
        client.os.toLowerCase().includes(normalized) ||
        matchesUpdate
      );
    });
  }, [query, statusFilter, serverFilter]);

  const counts = React.useMemo(() => {
    return {
      total: wsusClients.length,
      compliant: wsusClients.filter((c) => c.status === "compliant").length,
      needed: wsusClients.filter((c) => c.status === "needed").length,
      pendingReboot: wsusClients.filter((c) => c.status === "pending_reboot")
        .length,
      attention: wsusClients.filter(
        (c) => c.status === "failed" || c.status === "offline"
      ).length,
    };
  }, []);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              Tracked endpoints in inventory
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.compliant}</div>
            <p className="text-xs text-muted-foreground">
              No pending updates required
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Updates Needed / Reboot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {counts.needed + counts.pendingReboot}
            </div>
            <p className="text-xs text-muted-foreground">
              {counts.needed} needed · {counts.pendingReboot} pending reboot
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Failed / Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.attention}</div>
            <p className="text-xs text-muted-foreground">
              Require administrator review
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Client Update Status per Device</CardTitle>
            <CardDescription>
              Inspect patch compliance, WSUS server assignment, and per-device
              KB update details
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search device, IP, OS, or KB..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={serverFilter}
                onValueChange={(value) => setServerFilter(value ?? "all")}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All WSUS Servers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All WSUS Servers</SelectItem>
                  {wsusServers.map((srv) => (
                    <SelectItem key={srv.id} value={srv.name}>
                      {srv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="max-w-full overflow-x-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="compliant">Compliant</TabsTrigger>
                <TabsTrigger value="needed">Needed</TabsTrigger>
                <TabsTrigger value="pending_reboot">Reboot</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Target Group</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>WSUS Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Needed</TableHead>
                <TableHead className="text-right">Installed</TableHead>
                <TableHead className="text-right">Last Reported</TableHead>
                <TableHead className="text-right">Updates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No devices match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => {
                  const meta = clientStatusMeta[device.status];
                  return (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MonitorIcon className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{device.hostname}</div>
                            <div className="text-xs text-muted-foreground">
                              {device.ipAddress}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{device.targetGroup}</TableCell>
                      <TableCell>{device.os}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {device.serverName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {device.neededUpdates}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {device.installedUpdates}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {device.lastReported}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDevice(device)}
                        >
                          View ({device.updates.length})
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedDevice)}
        onOpenChange={(open) => {
          if (!open) setSelectedDevice(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDevice?.hostname}</DialogTitle>
            <DialogDescription>
              {selectedDevice?.os} · {selectedDevice?.ipAddress} ·{" "}
              {selectedDevice?.serverName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KB</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDevice?.updates.map((update) => (
                  <TableRow key={update.kb}>
                    <TableCell className="font-mono text-xs font-medium">
                      {update.kb}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      <div className="text-sm font-medium">{update.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Released {update.releasedAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {update.classification}
                    </TableCell>
                    <TableCell>
                      <Badge variant={updateStatusMeta[update.status]}>
                        {update.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {update.sizeMb} MB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
