import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserRole, verifyUser } from "@/lib/auth-users";
import type { UserRole } from "@/lib/rbac";

const VALID_ROLES = new Set<UserRole>(["admin", "operator", "viewer"]);

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string" ? credentials.username : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!username || !password) {
          return null;
        }

        return verifyUser(username, password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const username =
          typeof token.username === "string" ? token.username : "";
        const liveRole = username ? getUserRole(username) : null;
        session.user.id = token.sub ?? "";
        session.user.username = username;
        session.user.role =
          liveRole ??
          (typeof token.role === "string" &&
          VALID_ROLES.has(token.role as UserRole)
            ? (token.role as UserRole)
            : "viewer");
      }
      return session;
    },
  },
});
