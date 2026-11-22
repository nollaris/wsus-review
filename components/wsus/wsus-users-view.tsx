"use client";

import * as React from "react";
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicUser, UserStatus } from "@/lib/auth-users";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  USER_ROLES,
  type UserRole,
} from "@/lib/rbac";

const roleBadgeVariant: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  admin: "default",
  operator: "secondary",
  viewer: "outline",
};

interface UserFormState {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

const emptyForm: UserFormState = {
  name: "",
  username: "",
  password: "",
  role: "viewer",
  status: "Active",
};

export function WsusUsersView({
  initialUsers,
  currentUserId,
}: {
  initialUsers: PublicUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = React.useState<PublicUser[]>(initialUsers);
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<PublicUser | null>(null);
  const [form, setForm] = React.useState<UserFormState>(emptyForm);
  const [isSaving, setIsSaving] = React.useState(false);

  const filteredUsers = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!normalized) return true;
      return (
        u.name.toLowerCase().includes(normalized) ||
        u.username.toLowerCase().includes(normalized) ||
        ROLE_LABELS[u.role].toLowerCase().includes(normalized)
      );
    });
  }, [users, query, roleFilter]);

  function openCreateDialog() {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(user: PublicUser) {
    setEditingUser(user);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      status: user.status,
    });
    setDialogOpen(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            status: form.status,
            password: form.password || undefined,
          }),
        });
        const data = (await res.json()) as {
          user?: PublicUser;
          error?: string;
        };
        if (!res.ok || !data.user) {
          toast.error(data.error ?? "Failed to update user.");
          return;
        }
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data.user! : u))
        );
        toast.success(`Updated @${data.user.username}`);
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            username: form.username,
            password: form.password,
            role: form.role,
          }),
        });
        const data = (await res.json()) as {
          user?: PublicUser;
          error?: string;
        };
        if (!res.ok || !data.user) {
          toast.error(data.error ?? "Failed to create user.");
          return;
        }
        setUsers((prev) => [...prev, data.user!]);
        toast.success(`Created @${data.user.username}`);
      }

      setDialogOpen(false);
    } catch {
      toast.error("Request failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(user: PublicUser) {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete user.");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Removed @${user.username}`);
    } catch {
      toast.error("Failed to delete user.");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u) => u.status === "Active").length} active
              accounts
            </p>
          </CardContent>
        </Card>
        {USER_ROLES.map((role) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {ROLE_LABELS[role]}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === role).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {ROLE_PERMISSIONS[role].length} permissions granted
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>RBAC Role Matrix</CardTitle>
          <CardDescription>
            Permissions assigned to each role across WSUS Review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {USER_ROLES.map((role) => (
              <div
                key={role}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{ROLE_LABELS[role]}</span>
                  <Badge variant={roleBadgeVariant[role]}>{role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[role].map((perm) => (
                    <Badge key={perm} variant="outline" className="font-mono">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Users &amp; Roles</CardTitle>
              <CardDescription>
                Create accounts, assign RBAC roles, or disable user access
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <PlusIcon />
              Add User
            </Button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, username, role..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs
              value={roleFilter}
              onValueChange={setRoleFilter}
              className="max-w-full overflow-x-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="operator">Operator</TabsTrigger>
                <TabsTrigger value="viewer">Viewer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No users match the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {user.name}{" "}
                              {isSelf ? (
                                <span className="text-xs text-muted-foreground">
                                  (You)
                                </span>
                              ) : null}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active" ? "default" : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditDialog(user)}
                            aria-label={`Edit ${user.username}`}
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isSelf}
                            onClick={() => handleDelete(user)}
                            aria-label={`Delete ${user.username}`}
                          >
                            <Trash2Icon className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? `Edit @${editingUser.username}` : "Add User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update display name, RBAC role, status, or reset password."
                : "Create a new credentials account with an assigned RBAC role."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user-name">Full Name</FieldLabel>
                <Input
                  id="user-name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </Field>
              {!editingUser ? (
                <Field>
                  <FieldLabel htmlFor="user-username">Username</FieldLabel>
                  <Input
                    id="user-username"
                    placeholder="janedoe"
                    minLength={3}
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                  />
                </Field>
              ) : null}
              <Field>
                <FieldLabel htmlFor="user-password">
                  {editingUser
                    ? "New Password (leave blank to keep)"
                    : "Password"}
                </FieldLabel>
                <Input
                  id="user-password"
                  type="password"
                  minLength={editingUser ? undefined : 8}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required={!editingUser}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>RBAC Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(value) => {
                      if (!value) return;
                      setForm((prev) => ({
                        ...prev,
                        role: value as UserRole,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {editingUser ? (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={form.status}
                      onValueChange={(value) => {
                        if (!value) return;
                        setForm((prev) => ({
                          ...prev,
                          status: value as UserStatus,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
              </div>
              <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
                <span>{ROLE_DESCRIPTIONS[form.role]}</span>
              </div>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingUser
                    ? "Save Changes"
                    : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
