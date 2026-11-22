import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

import type { UserRole } from "@/lib/rbac";

declare module "next-auth" {
  interface User {
    username?: string;
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: UserRole;
  }
}
