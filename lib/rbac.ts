export type UserRole = "admin" | "operator" | "viewer";

export type Permission =
  | "users:manage"
  | "servers:manage"
  | "servers:sync"
  | "patches:approve"
  | "settings:manage"
  | "logs:view"
  | "devices:view";

export const USER_ROLES: UserRole[] = ["admin", "operator", "viewer"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  operator: "Patch Operator",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access to user management, WSUS servers, patches, and settings.",
  operator: "Can approve/decline patches and run server syncs.",
  viewer: "Read-only access to dashboards, devices, patches, and logs.",
};

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "users:manage",
    "servers:manage",
    "servers:sync",
    "patches:approve",
    "settings:manage",
    "logs:view",
    "devices:view",
  ],
  operator: ["servers:sync", "patches:approve", "logs:view", "devices:view"],
  viewer: ["logs:view", "devices:view"],
};

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
