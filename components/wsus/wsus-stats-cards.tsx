import {
  ActivityIcon,
  AlertTriangleIcon,
  MonitorCheckIcon,
  ShieldCheckIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { wsusStats } from "@/data/wsus-sample";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "total-clients": MonitorCheckIcon,
  "compliance-rate": ShieldCheckIcon,
  "pending-updates": AlertTriangleIcon,
  "server-health": ActivityIcon,
};

export function WsusStatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {wsusStats.map((stat) => {
        const Icon = iconMap[stat.id] ?? ActivityIcon;
        return (
          <Card key={stat.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription className="mt-1">
                {stat.description}
              </CardDescription>
              <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
