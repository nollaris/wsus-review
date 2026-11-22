import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deleteUserById,
  updateUserById,
  type UserStatus,
} from "@/lib/auth-users";
import { hasPermission, USER_ROLES, type UserRole } from "@/lib/rbac";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: unknown;
      role?: unknown;
      status?: unknown;
      password?: unknown;
    };

    const name = typeof body.name === "string" ? body.name : undefined;
    const role =
      typeof body.role === "string" &&
      USER_ROLES.includes(body.role as UserRole)
        ? (body.role as UserRole)
        : undefined;
    const status: UserStatus | undefined =
      body.status === "Active" || body.status === "Disabled"
        ? body.status
        : undefined;
    const password =
      typeof body.password === "string" && body.password.length > 0
        ? body.password
        : undefined;

    const result = updateUserById(id, { name, role, status, password });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const result = deleteUserById(id, session.user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json({ ok: true });
}
