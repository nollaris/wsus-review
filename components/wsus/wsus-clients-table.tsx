"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  type ClientComplianceStatus,
} from "@/data/wsus-sample";

const statusMeta: Record<
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

export function WsusClientsTable() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredClients = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return wsusClients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalized) return true;

      return (
        client.hostname.toLowerCase().includes(normalized) ||
        client.ipAddress.toLowerCase().includes(normalized) ||
        client.targetGroup.toLowerCase().includes(normalized) ||
        client.os.toLowerCase().includes(normalized) ||
        client.serverName.toLowerCase().includes(normalized)
      );
    });
  }, [query, statusFilter]);

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>WSUS Client Status</CardTitle>
          <CardDescription>
            Endpoint patch compliance, target group assignment, and last
            check-in
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search host, IP, group, OS..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
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
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hostname</TableHead>
              <TableHead>Target Group</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>WSUS Server</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Needed</TableHead>
              <TableHead className="text-right">Installed</TableHead>
              <TableHead className="text-right">Last Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No WSUS clients match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const meta = statusMeta[client.status];
                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.hostname}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.ipAddress}
                      </div>
                    </TableCell>
                    <TableCell>{client.targetGroup}</TableCell>
                    <TableCell>{client.os}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {client.serverName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {client.neededUpdates}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {client.installedUpdates}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {client.lastReported}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
