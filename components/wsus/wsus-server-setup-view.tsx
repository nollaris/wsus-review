"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2Icon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  ServerIcon,
  Trash2Icon,
  WifiIcon,
} from "lucide-react";
import { toast } from "sonner";

import { hasPermission } from "@/lib/rbac";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import {
  WSUS_CLASSIFICATIONS,
  WSUS_PRODUCTS,
  WSUS_TARGET_GROUPS,
  wsusServers,
  type WsusServer,
} from "@/data/wsus-sample";

interface ConfiguredWsusServer extends WsusServer {
  port: number;
  useSsl: boolean;
}

const initialServers: ConfiguredWsusServer[] = wsusServers.map((srv) => ({
  ...srv,
  port: srv.role === "Autonomous" ? 8531 : 8530,
  useSsl: srv.role === "Autonomous",
}));

interface ServerFormState {
  name: string;
  ipAddress: string;
  port: string;
  useSsl: boolean;
  role: WsusServer["role"];
  syncIntervalHours: string;
  storageTotalGb: string;
  products: string[];
  classifications: string[];
  targetGroups: string[];
}

const emptyForm: ServerFormState = {
  name: "",
  ipAddress: "",
  port: "8530",
  useSsl: false,
  role: "Downstream Replica",
  syncIntervalHours: "12",
  storageTotalGb: "500",
  products: ["Windows Server 2022", "Windows 11"],
  classifications: ["Security Updates", "Critical Updates"],
  targetGroups: ["All Computers"],
};

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

function toggleListItem(list: string[], value: string, checked: boolean) {
  if (checked) {
    return list.includes(value) ? list : [...list, value];
  }
  return list.filter((item) => item !== value);
}

export function WsusServerSetupView() {
  const { data: session } = useSession();
  const canManageServers = hasPermission(session?.user?.role, "servers:manage");
  const canSyncServers = hasPermission(session?.user?.role, "servers:sync");

  const [servers, setServers] =
    React.useState<ConfiguredWsusServer[]>(initialServers);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ServerFormState>(emptyForm);

  function openAddDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(server: ConfiguredWsusServer) {
    setEditingId(server.id);
    setForm({
      name: server.name,
      ipAddress: server.ipAddress,
      port: String(server.port),
      useSsl: server.useSsl,
      role: server.role,
      syncIntervalHours: String(server.syncIntervalHours),
      storageTotalGb: String(server.storageTotalGb),
      products: server.products,
      classifications: server.classifications,
      targetGroups: server.targetGroups,
    });
    setDialogOpen(true);
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const portNum = Number(form.port) || (form.useSsl ? 8531 : 8530);
    const storageTotal = Number(form.storageTotalGb) || 500;
    const syncIntervalHours = Math.max(1, Number(form.syncIntervalHours) || 12);

    if (editingId) {
      setServers((prev) =>
        prev.map((srv) =>
          srv.id === editingId
            ? {
                ...srv,
                name: form.name.trim(),
                ipAddress: form.ipAddress.trim(),
                port: portNum,
                useSsl: form.useSsl,
                role: form.role,
                syncIntervalHours,
                storageTotalGb: storageTotal,
                products: form.products,
                classifications: form.classifications,
                targetGroups: form.targetGroups,
              }
            : srv
        )
      );
      toast.success(`Updated ${form.name.trim()}`);
    } else {
      const newServer: ConfiguredWsusServer = {
        id: `srv-${Date.now()}`,
        name: form.name.trim(),
        ipAddress: form.ipAddress.trim(),
        port: portNum,
        useSsl: form.useSsl,
        role: form.role,
        version: "10.0.20348.2700",
        syncStatus: "Succeeded",
        lastSync: "Not synced yet",
        syncIntervalHours,
        storageUsedGb: 0,
        storageTotalGb: storageTotal,
        connectedClients: 0,
        products: form.products,
        classifications: form.classifications,
        targetGroups: form.targetGroups,
      };
      setServers((prev) => [...prev, newServer]);
      toast.success(`Added ${newServer.name}`);
    }

    setDialogOpen(false);
  }

  function handleTestConnection(server: ConfiguredWsusServer) {
    const protocol = server.useSsl ? "https" : "http";
    toast.success(
      `Connection succeeded to ${server.name} (${protocol}://${server.ipAddress}:${server.port})`
    );
  }

  function handleSyncNow(server: ConfiguredWsusServer) {
    setServers((prev) =>
      prev.map((srv) =>
        srv.id === server.id
          ? { ...srv, syncStatus: "Succeeded", lastSync: "Just now" }
          : srv
      )
    );
    toast.success(`Synchronization completed for ${server.name}`);
  }

  function handleDelete(server: ConfiguredWsusServer) {
    setServers((prev) => prev.filter((srv) => srv.id !== server.id));
    toast.success(`Removed ${server.name}`);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Configured Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
            <p className="text-xs text-muted-foreground">
              Upstream, replica, and autonomous nodes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SSL Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servers.filter((s) => s.useSsl).length} / {servers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              HTTPS transport on port 8531
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Healthy Sync Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <CheckCircle2Icon className="size-5 text-primary" />
              <span>
                {servers.filter((s) => s.syncStatus === "Succeeded").length} /{" "}
                {servers.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Synchronization status across fleet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>WSUS Servers</CardTitle>
            <CardDescription>
              Configure server endpoints, time sync intervals, target groups,
              patch products, and classifications
            </CardDescription>
          </div>
          <Button onClick={openAddDialog} disabled={!canManageServers}>
            <PlusIcon />
            Add WSUS Server
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Server</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Interval Time Sync</TableHead>
                <TableHead>Groups / Hosts</TableHead>
                <TableHead>Products &amp; Classifications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No WSUS servers configured. Click &ldquo;Add WSUS
                    Server&rdquo; to register one.
                  </TableCell>
                </TableRow>
              ) : (
                servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ServerIcon className="size-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{server.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {server.role} · {server.connectedClients} clients
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {server.useSsl ? "https" : "http"}://{server.ipAddress}:
                      {server.port}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <ClockIcon className="size-3.5 text-muted-foreground" />
                        Every {server.syncIntervalHours}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last: {server.lastSync}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-44 whitespace-normal">
                      <div className="flex flex-wrap gap-1">
                        {server.targetGroups.map((group) => (
                          <Badge key={group} variant="outline">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-56 whitespace-normal">
                      <div className="text-xs font-medium">
                        {server.products.length} products
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {server.classifications.join(", ") || "None"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSyncBadgeVariant(server.syncStatus)}>
                        {server.syncStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canSyncServers}
                          onClick={() => handleTestConnection(server)}
                          title="Test Connection"
                        >
                          <WifiIcon className="size-3.5" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canSyncServers}
                          onClick={() => handleSyncNow(server)}
                          title="Sync Now"
                        >
                          <RefreshCwIcon className="size-3.5" />
                          Sync
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!canManageServers}
                          onClick={() => openEditDialog(server)}
                          aria-label={`Edit ${server.name}`}
                        >
                          <PencilIcon className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!canManageServers}
                          onClick={() => handleDelete(server)}
                          aria-label={`Remove ${server.name}`}
                        >
                          <Trash2Icon className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit WSUS Server" : "Add WSUS Server"}
            </DialogTitle>
            <DialogDescription>
              Configure connection, time sync interval, target groups, patch
              products, and classifications.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="srv-name">Server Name</FieldLabel>
                <Input
                  id="srv-name"
                  placeholder="WSUS-PRIMARY-01"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field className="col-span-2">
                  <FieldLabel htmlFor="srv-ip">Hostname / IP</FieldLabel>
                  <Input
                    id="srv-ip"
                    placeholder="10.20.1.15"
                    value={form.ipAddress}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ipAddress: e.target.value,
                      }))
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="srv-port">Port</FieldLabel>
                  <Input
                    id="srv-port"
                    type="number"
                    value={form.port}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, port: e.target.value }))
                    }
                    required
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field>
                  <FieldLabel>Server Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(value) => {
                      if (!value) return;
                      setForm((prev) => ({
                        ...prev,
                        role: value as WsusServer["role"],
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upstream">Upstream</SelectItem>
                      <SelectItem value="Downstream Replica">
                        Downstream Replica
                      </SelectItem>
                      <SelectItem value="Autonomous">Autonomous</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Interval Time Sync</FieldLabel>
                  <Select
                    value={form.syncIntervalHours}
                    onValueChange={(value) => {
                      if (!value) return;
                      setForm((prev) => ({
                        ...prev,
                        syncIntervalHours: value,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1 hour</SelectItem>
                      <SelectItem value="4">Every 4 hours</SelectItem>
                      <SelectItem value="6">Every 6 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Every 24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="srv-storage">Storage (GB)</FieldLabel>
                  <Input
                    id="srv-storage"
                    type="number"
                    min={50}
                    value={form.storageTotalGb}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        storageTotalGb: e.target.value,
                      }))
                    }
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Target Groups / Hosts</FieldLabel>
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                  {WSUS_TARGET_GROUPS.map((group) => (
                    <label
                      key={group}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={form.targetGroups.includes(group)}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            targetGroups: toggleListItem(
                              prev.targetGroups,
                              group,
                              Boolean(checked)
                            ),
                          }))
                        }
                      />
                      <span>{group}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>Patch Products</FieldLabel>
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                  {WSUS_PRODUCTS.map((product) => (
                    <label
                      key={product}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={form.products.includes(product)}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            products: toggleListItem(
                              prev.products,
                              product,
                              Boolean(checked)
                            ),
                          }))
                        }
                      />
                      <span>{product}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>Classifications</FieldLabel>
                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                  {WSUS_CLASSIFICATIONS.map((classification) => (
                    <label
                      key={classification}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <Checkbox
                        checked={form.classifications.includes(classification)}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            classifications: toggleListItem(
                              prev.classifications,
                              classification,
                              Boolean(checked)
                            ),
                          }))
                        }
                      />
                      <span>{classification}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field orientation="horizontal">
                <Checkbox
                  id="srv-ssl"
                  checked={form.useSsl}
                  onCheckedChange={(checked) => {
                    const useSsl = Boolean(checked);
                    setForm((prev) => ({
                      ...prev,
                      useSsl,
                      port: useSsl ? "8531" : "8530",
                    }));
                  }}
                />
                <FieldLabel htmlFor="srv-ssl" className="cursor-pointer">
                  Use SSL / HTTPS (Port 8531)
                </FieldLabel>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Server"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
