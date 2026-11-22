import { WsusCharts } from "@/components/wsus/wsus-charts";
import { WsusClientsTable } from "@/components/wsus/wsus-clients-table";
import { WsusServersCard } from "@/components/wsus/wsus-servers-card";
import { WsusStatsCards } from "@/components/wsus/wsus-stats-cards";

export default function HomePage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          WSUS Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor Windows Server Update Services client compliance and server
          synchronization status.
        </p>
      </div>

      <WsusStatsCards />
      <WsusCharts />
      <WsusServersCard />
      <WsusClientsTable />
    </div>
  );
}
