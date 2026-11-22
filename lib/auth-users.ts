import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import type { UserRole } from "@/lib/rbac";

export type UserStatus = "Active" | "Disabled";

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  passwordHash: string;
}

export type PublicUser = Omit<AppUser, "passwordHash">;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function toPublicUser(user: AppUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

const globalForUsers = globalThis as typeof globalThis & {
  __wsusReviewUsers?: Map<string, AppUser>;
};

function getUserStore(): Map<string, AppUser> {
  const defaultAdminUsername = (
    process.env.AUTH_DEMO_USERNAME ?? "admin"
  ).toLowerCase();
  const defaultAdminPassword = process.env.AUTH_DEMO_PASSWORD ?? "admin123";

  if (!globalForUsers.__wsusReviewUsers) {
    globalForUsers.__wsusReviewUsers = new Map<string, AppUser>();
  }

  const store = globalForUsers.__wsusReviewUsers;

  // Backfill role/status/createdAt for any users created before RBAC HMR reload
  for (const [key, user] of store.entries()) {
    if (!user.role || !user.status || !user.createdAt) {
      store.set(key, {
        ...user,
        role: user.role ?? (key === defaultAdminUsername ? "admin" : "viewer"),
        status: user.status ?? "Active",
        createdAt: user.createdAt ?? "2026-11-01",
      });
    }
  }

  if (!store.has(defaultAdminUsername)) {
    store.set(defaultAdminUsername, {
      id: "1",
      username: defaultAdminUsername,
      name: "Administrator",
      role: "admin",
      status: "Active",
      createdAt: "2026-11-01",
      passwordHash: hashPassword(defaultAdminPassword),
    });
  }

  if (!store.has("operator")) {
    store.set("operator", {
      id: "2",
      username: "operator",
      name: "Patch Operator",
      role: "operator",
      status: "Active",
      createdAt: "2026-11-10",
      passwordHash: hashPassword("operator123"),
    });
  }

  if (!store.has("viewer")) {
    store.set("viewer", {
      id: "3",
      username: "viewer",
      name: "Audit Viewer",
      role: "viewer",
      status: "Active",
      createdAt: "2026-11-15",
      passwordHash: hashPassword("viewer123"),
    });
  }

  return store;
}

export function verifyUser(
  username: string,
  password: string
): { id: string; username: string; name: string; role: UserRole } | null {
  const normalized = username.trim().toLowerCase();
  const user = getUserStore().get(normalized);
  if (!user || user.status !== "Active") return null;

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

export function getUserRole(username: string): UserRole | null {
  const user = getUserStore().get(username.trim().toLowerCase());
  return user?.role ?? null;
}

export function listUsers(): PublicUser[] {
  return Array.from(getUserStore().values()).map(toPublicUser);
}

export function registerUser(input: {
  username: string;
  name: string;
  password: string;
  role?: UserRole;
}):
  | { ok: true; user: PublicUser }
  | { ok: false; error: string; status: number } {
  const normalized = input.username.trim().toLowerCase();
  const name = input.name.trim();

  if (normalized.length < 3) {
    return {
      ok: false,
      error: "Username must be at least 3 characters.",
      status: 400,
    };
  }

  if (input.password.length < 8) {
    return {
      ok: false,
      error: "Password must be at least 8 characters.",
      status: 400,
    };
  }

  const store = getUserStore();
  if (store.has(normalized)) {
    return {
      ok: false,
      error: "Username is already taken.",
      status: 409,
    };
  }

  const maxId = Array.from(store.values()).reduce(
    (max, u) => Math.max(max, Number(u.id) || 0),
    0
  );

  const newUser: AppUser = {
    id: String(maxId + 1),
    username: normalized,
    name: name || normalized,
    role: input.role ?? "viewer",
    status: "Active",
    createdAt: new Date().toISOString().slice(0, 10),
    passwordHash: hashPassword(input.password),
  };

  store.set(normalized, newUser);

  return {
    ok: true,
    user: toPublicUser(newUser),
  };
}

export function updateUserById(
  id: string,
  updates: {
    name?: string;
    role?: UserRole;
    status?: UserStatus;
    password?: string;
  }
):
  | { ok: true; user: PublicUser }
  | { ok: false; error: string; status: number } {
  const store = getUserStore();
  const target = Array.from(store.values()).find((u) => u.id === id);
  if (!target) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  const nextRole = updates.role ?? target.role;
  const nextStatus = updates.status ?? target.status;

  if (
    target.role === "admin" &&
    target.status === "Active" &&
    (nextRole !== "admin" || nextStatus !== "Active")
  ) {
    const activeAdmins = Array.from(store.values()).filter(
      (u) => u.role === "admin" && u.status === "Active"
    );
    if (activeAdmins.length <= 1) {
      return {
        ok: false,
        error: "At least one active administrator is required.",
        status: 400,
      };
    }
  }

  if (updates.password && updates.password.length < 8) {
    return {
      ok: false,
      error: "Password must be at least 8 characters.",
      status: 400,
    };
  }

  const updated: AppUser = {
    ...target,
    name: updates.name?.trim() || target.name,
    role: nextRole,
    status: nextStatus,
    passwordHash: updates.password
      ? hashPassword(updates.password)
      : target.passwordHash,
  };

  store.set(target.username, updated);

  return { ok: true, user: toPublicUser(updated) };
}

export function deleteUserById(
  id: string,
  actorId?: string
): { ok: true } | { ok: false; error: string; status: number } {
  const store = getUserStore();
  const target = Array.from(store.values()).find((u) => u.id === id);
  if (!target) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  if (actorId && target.id === actorId) {
    return {
      ok: false,
      error: "You cannot delete your own account.",
      status: 400,
    };
  }

  if (target.role === "admin" && target.status === "Active") {
    const activeAdmins = Array.from(store.values()).filter(
      (u) => u.role === "admin" && u.status === "Active"
    );
    if (activeAdmins.length <= 1) {
      return {
        ok: false,
        error: "Cannot delete the last active administrator.",
        status: 400,
      };
    }
  }

  store.delete(target.username);
  return { ok: true };
}
