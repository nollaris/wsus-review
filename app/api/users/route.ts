import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listUsers, registerUser } from "@/lib/auth-users";
import { hasPermission, USER_ROLES, type UserRole } from "@/lib/rbac";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ users: listUsers() });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      username?: unknown;
      password?: unknown;
      role?: unknown;
    };

    const name = typeof body.name === "string" ? body.name : "";
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role =
      typeof body.role === "string" &&
      USER_ROLES.includes(body.role as UserRole)
        ? (body.role as UserRole)
        : "viewer";

    const result = registerUser({ name, username, password, role });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
