import { NextResponse } from "next/server";

import { registerUser } from "@/lib/auth-users";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      username?: unknown;
      password?: unknown;
    };

    const name = typeof body.name === "string" ? body.name : "";
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    const result = registerUser({ name, username, password });
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
