import type { Metadata } from "next";

import { WsusPatchesView } from "@/components/wsus/wsus-patches-view";

export const metadata: Metadata = {
  title: "Patches",
  description: "Approve or decline WSUS patches by product and classification",
};

export default function PatchesPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Patch Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve or decline updates per WSUS server, target group, product, and
          classification.
        </p>
      </div>

      <WsusPatchesView />
    </div>
  );
}
