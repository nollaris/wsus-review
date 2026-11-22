"use client";

import * as React from "react";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  wsusLogs,
  type WsusLogCategory,
  type WsusLogLevel,
} from "@/data/wsus-sample";

const levelVariant: Record<
  WsusLogLevel,
  "default" | "secondary" | "destructive"
> = {
  Info: "secondary",
  Warning: "default",
  Error: "destructive",
};

const categories: WsusLogCategory[] = [
  "Sync",
  "Approval",
  "Client",
  "Server",
  "Auth",
];

export function WsusLogsView() {
  const [query, setQuery] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const filteredLogs = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return wsusLogs.filter((entry) => {
      if (levelFilter !== "all" && entry.level !== levelFilter) {
        return false;
      }
      if (categoryFilter !== "all" && entry.category !== categoryFilter) {
        return false;
      }
      if (!normalized) return true;

      return (
        entry.message.toLowerCase().includes(normalized) ||
        entry.source.toLowerCase().includes(normalized) ||
        entry.actor.toLowerCase().includes(normalized) ||
        entry.category.toLowerCase().includes(normalized)
      );
    });
  }, [query, levelFilter, categoryFilter]);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wsusLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wsusLogs.filter((l) => l.level === "Info").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wsusLogs.filter((l) => l.level === "Warning").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wsusLogs.filter((l) => l.level === "Error").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Activity &amp; Sync Logs</CardTitle>
              <CardDescription>
                Audit trail for WSUS synchronization, patch approvals, client
                failures, and authentication events
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Logs refreshed")}
            >
              <RefreshCwIcon className="size-3.5" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search message, source, actor..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v ?? "all")}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs
              value={levelFilter}
              onValueChange={setLevelFilter}
              className="max-w-full overflow-x-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Info">Info</TabsTrigger>
                <TabsTrigger value="Warning">Warning</TabsTrigger>
                <TabsTrigger value="Error">Error</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No log entries match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.timestamp}
                    </TableCell>
                    <TableCell>
                      <Badge variant={levelVariant[entry.level]}>
                        {entry.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.source}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.actor}
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal text-sm">
                      {entry.message}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
