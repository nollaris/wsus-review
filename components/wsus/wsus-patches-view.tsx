"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
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
  WSUS_CLASSIFICATIONS,
  WSUS_PRODUCTS,
  wsusPatches,
  wsusServers,
  type PatchApprovalStatus,
  type WsusPatchItem,
} from "@/data/wsus-sample";

const approvalVariant: Record<
  PatchApprovalStatus,
  "default" | "destructive" | "secondary"
> = {
  Approved: "default",
  Declined: "destructive",
  "Not Approved": "secondary",
};

export function WsusPatchesView() {
  const { data: session } = useSession();
  const canApprove = hasPermission(session?.user?.role, "patches:approve");

  const [patches, setPatches] = React.useState<WsusPatchItem[]>(wsusPatches);
  const [query, setQuery] = React.useState("");
  const [approvalFilter, setApprovalFilter] = React.useState("all");
  const [serverFilter, setServerFilter] = React.useState("all");
  const [productFilter, setProductFilter] = React.useState("all");
  const [classificationFilter, setClassificationFilter] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const filteredPatches = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return patches.filter((patch) => {
      if (approvalFilter !== "all" && patch.approvalStatus !== approvalFilter) {
        return false;
      }
      if (serverFilter !== "all" && patch.serverName !== serverFilter) {
        return false;
      }
      if (productFilter !== "all" && patch.product !== productFilter) {
        return false;
      }
      if (
        classificationFilter !== "all" &&
        patch.classification !== classificationFilter
      ) {
        return false;
      }
      if (!normalized) return true;

      return (
        patch.kb.toLowerCase().includes(normalized) ||
        patch.title.toLowerCase().includes(normalized) ||
        patch.targetGroup.toLowerCase().includes(normalized)
      );
    });
  }, [
    patches,
    query,
    approvalFilter,
    serverFilter,
    productFilter,
    classificationFilter,
  ]);

  function updateApproval(ids: string[], status: PatchApprovalStatus) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setPatches((prev) =>
      prev.map((p) => (idSet.has(p.id) ? { ...p, approvalStatus: status } : p))
    );
    setSelectedIds([]);
    toast.success(
      `${status} ${ids.length} ${ids.length === 1 ? "patch" : "patches"}`
    );
  }

  const allVisibleSelected =
    filteredPatches.length > 0 &&
    filteredPatches.every((p) => selectedIds.includes(p.id));

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patches.filter((p) => p.approvalStatus === "Approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Not Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                patches.filter((p) => p.approvalStatus === "Not Approved")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patches.filter((p) => p.approvalStatus === "Declined").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Patch Approvals</CardTitle>
              <CardDescription>
                Approve or decline updates by WSUS server, target group,
                product, and classification
              </CardDescription>
            </div>
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedIds.length} selected
                </span>
                <Button
                  size="sm"
                  onClick={() => updateApproval(selectedIds, "Approved")}
                >
                  <CheckIcon className="size-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateApproval(selectedIds, "Declined")}
                >
                  <XIcon className="size-3.5" />
                  Decline
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search KB, title, or group..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={serverFilter}
                onValueChange={(v) => setServerFilter(v ?? "all")}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Servers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Servers</SelectItem>
                  {wsusServers.map((srv) => (
                    <SelectItem key={srv.id} value={srv.name}>
                      {srv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={productFilter}
                onValueChange={(v) => setProductFilter(v ?? "all")}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {WSUS_PRODUCTS.map((prod) => (
                    <SelectItem key={prod} value={prod}>
                      {prod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={classificationFilter}
                onValueChange={(v) => setClassificationFilter(v ?? "all")}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Classifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  {WSUS_CLASSIFICATIONS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs
              value={approvalFilter}
              onValueChange={setApprovalFilter}
              className="max-w-full overflow-x-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Approved">Approved</TabsTrigger>
                <TabsTrigger value="Not Approved">Not Approved</TabsTrigger>
                <TabsTrigger value="Declined">Declined</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(filteredPatches.map((p) => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    aria-label="Select all patches"
                  />
                </TableHead>
                <TableHead>KB</TableHead>
                <TableHead>Update Title</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Server / Group</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No patches match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatches.map((patch) => (
                  <TableRow key={patch.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(patch.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, patch.id]
                              : prev.filter((id) => id !== patch.id)
                          );
                        }}
                        aria-label={`Select ${patch.kb}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {patch.kb}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      <div className="font-medium">{patch.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {patch.releasedAt} · {patch.sizeMb} MB
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{patch.product}</TableCell>
                    <TableCell className="text-xs">
                      {patch.classification}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">
                        {patch.serverName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {patch.targetGroup}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={approvalVariant[patch.approvalStatus]}>
                        {patch.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !canApprove || patch.approvalStatus === "Approved"
                          }
                          onClick={() => updateApproval([patch.id], "Approved")}
                        >
                          <CheckIcon className="size-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !canApprove || patch.approvalStatus === "Declined"
                          }
                          onClick={() => updateApproval([patch.id], "Declined")}
                        >
                          <XIcon className="size-3.5" />
                          Decline
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
    </div>
  );
}
