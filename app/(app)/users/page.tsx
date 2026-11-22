import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { WsusUsersView } from "@/components/wsus/wsus-users-view";
import { listUsers } from "@/lib/auth-users";
import { hasPermission } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Users",
  description: "User management and role-based access control",
};

async function UsersContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!hasPermission(session.user.role, "users:manage")) {
    redirect("/");
  }

  const initialUsers = listUsers();

  return (
    <WsusUsersView
      initialUsers={initialUsers}
      currentUserId={session.user.id}
    />
  );
}

export default function UsersPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and role-based access control (RBAC) across WSUS
          Review.
        </p>
      </div>

      <Suspense fallback={null}>
        <UsersContent />
      </Suspense>
    </div>
  );
}
