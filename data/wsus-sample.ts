export type ClientComplianceStatus =
  | "compliant"
  | "needed"
  | "pending_reboot"
  | "failed"
  | "offline";

export interface WsusStat {
  id: string;
  label: string;
  value: string;
  description: string;
  trend: string;
}

export interface WsusCompliancePoint {
  date: string;
  compliant: number;
  pendingReboot: number;
  failed: number;
}

export interface WsusStatusBreakdownPoint {
  status: string;
  key: "compliant" | "needed" | "pendingReboot" | "failed" | "offline";
  count: number;
  fill: string;
}

export type PatchApprovalStatus = "Approved" | "Declined" | "Not Approved";

export interface WsusPatchItem {
  id: string;
  kb: string;
  title: string;
  product: string;
  classification: string;
  releasedAt: string;
  sizeMb: number;
  serverName: string;
  targetGroup: string;
  approvalStatus: PatchApprovalStatus;
}

export type WsusLogLevel = "Info" | "Warning" | "Error";
export type WsusLogCategory = "Sync" | "Approval" | "Client" | "Auth" | "Server";

export interface WsusLogEntry {
  id: string;
  timestamp: string;
  level: WsusLogLevel;
  category: WsusLogCategory;
  source: string;
  actor: string;
  message: string;
}

export const WSUS_PRODUCTS = [
  "Windows Server 2022",
  "Windows Server 2019",
  "Windows 11",
  "Windows 10",
  "SQL Server 2019",
  ".NET Framework",
  "Microsoft Defender Antivirus",
] as const;

export const WSUS_CLASSIFICATIONS = [
  "Security Updates",
  "Critical Updates",
  "Cumulative Updates",
  "Update Rollups",
  "Definition Updates",
  "Service Packs",
] as const;

export const WSUS_TARGET_GROUPS = [
  "All Computers",
  "Domain Controllers",
  "Production Servers",
  "Database Servers",
  "Finance Workstations",
  "Engineering Workstations",
  "DMZ Web Tier",
  "Retail Endpoints",
] as const;

export interface WsusServer {
  id: string;
  name: string;
  role: "Upstream" | "Downstream Replica" | "Autonomous";
  ipAddress: string;
  version: string;
  syncStatus: "Succeeded" | "Syncing" | "Warning";
  lastSync: string;
  storageUsedGb: number;
  storageTotalGb: number;
  connectedClients: number;
  syncIntervalHours: number;
  products: string[];
  classifications: string[];
  targetGroups: string[];
}

export interface WsusDeviceUpdate {
  kb: string;
  title: string;
  classification: "Security Update" | "Critical Update" | "Cumulative Update" | "Definition Update";
  status: "Installed" | "Needed" | "Pending Reboot" | "Failed";
  releasedAt: string;
  sizeMb: number;
}

export interface WsusClient {
  id: string;
  hostname: string;
  ipAddress: string;
  targetGroup: string;
  os: string;
  status: ClientComplianceStatus;
  neededUpdates: number;
  installedUpdates: number;
  lastReported: string;
  serverName: string;
  updates: WsusDeviceUpdate[];
}

export const wsusStats: WsusStat[] = [
  {
    id: "total-clients",
    label: "Managed Clients",
    value: "1,248",
    description: "Active endpoints reporting to WSUS",
    trend: "+14 from last week",
  },
  {
    id: "compliance-rate",
    label: "Compliance Rate",
    value: "91.4%",
    description: "1,141 clients fully patched",
    trend: "+2.3% since Patch Tuesday",
  },
  {
    id: "pending-updates",
    label: "Updates Needed / Failed",
    value: "89",
    description: "24 critical security updates pending",
    trend: "18 awaiting reboot",
  },
  {
    id: "server-health",
    label: "WSUS Server Health",
    value: "3 / 3",
    description: "All sync services operational",
    trend: "Last sync 12 mins ago",
  },
];

export const wsusComplianceTrend: WsusCompliancePoint[] = [
  { date: "Nov 16", compliant: 1052, pendingReboot: 48, failed: 22 },
  { date: "Nov 17", compliant: 1078, pendingReboot: 41, failed: 19 },
  { date: "Nov 18", compliant: 1095, pendingReboot: 36, failed: 16 },
  { date: "Nov 19", compliant: 1110, pendingReboot: 32, failed: 14 },
  { date: "Nov 20", compliant: 1124, pendingReboot: 27, failed: 12 },
  { date: "Nov 21", compliant: 1135, pendingReboot: 21, failed: 10 },
  { date: "Nov 22", compliant: 1141, pendingReboot: 18, failed: 9 },
];

export const wsusStatusBreakdown: WsusStatusBreakdownPoint[] = [
  {
    status: "Compliant",
    key: "compliant",
    count: 1141,
    fill: "var(--color-compliant)",
  },
  {
    status: "Updates Needed",
    key: "needed",
    count: 62,
    fill: "var(--color-needed)",
  },
  {
    status: "Pending Reboot",
    key: "pendingReboot",
    count: 18,
    fill: "var(--color-pendingReboot)",
  },
  {
    status: "Failed",
    key: "failed",
    count: 9,
    fill: "var(--color-failed)",
  },
  {
    status: "Offline (>30d)",
    key: "offline",
    count: 18,
    fill: "var(--color-offline)",
  },
];

export const wsusServers: WsusServer[] = [
  {
    id: "srv-1",
    name: "WSUS-PRIMARY-01",
    role: "Upstream",
    ipAddress: "10.20.1.15",
    version: "10.0.20348.2700",
    syncStatus: "Succeeded",
    lastSync: "12 mins ago",
    storageUsedGb: 184,
    storageTotalGb: 500,
    connectedClients: 642,
    syncIntervalHours: 6,
    products: [
      "Windows Server 2022",
      "Windows Server 2019",
      "SQL Server 2019",
      ".NET Framework",
    ],
    classifications: [
      "Security Updates",
      "Critical Updates",
      "Cumulative Updates",
    ],
    targetGroups: [
      "Domain Controllers",
      "Production Servers",
      "Database Servers",
    ],
  },
  {
    id: "srv-2",
    name: "WSUS-BRANCH-EAST",
    role: "Downstream Replica",
    ipAddress: "10.30.4.20",
    version: "10.0.20348.2700",
    syncStatus: "Succeeded",
    lastSync: "28 mins ago",
    storageUsedGb: 142,
    storageTotalGb: 300,
    connectedClients: 418,
    syncIntervalHours: 12,
    products: ["Windows 11", "Windows 10", "Microsoft Defender Antivirus"],
    classifications: [
      "Security Updates",
      "Critical Updates",
      "Definition Updates",
    ],
    targetGroups: [
      "Finance Workstations",
      "Engineering Workstations",
      "Retail Endpoints",
    ],
  },
  {
    id: "srv-3",
    name: "WSUS-DMZ-01",
    role: "Autonomous",
    ipAddress: "172.16.8.10",
    version: "10.0.20348.2655",
    syncStatus: "Warning",
    lastSync: "3 hours ago",
    storageUsedGb: 215,
    storageTotalGb: 250,
    connectedClients: 188,
    syncIntervalHours: 24,
    products: ["Windows Server 2022", ".NET Framework"],
    classifications: ["Security Updates", "Critical Updates"],
    targetGroups: ["DMZ Web Tier"],
  },
];

export const wsusPatches: WsusPatchItem[] = [
  {
    id: "patch-1",
    kb: "KB5046616",
    title: "2026-11 Cumulative Update for Windows Server 2022 (x64)",
    product: "Windows Server 2022",
    classification: "Cumulative Updates",
    releasedAt: "2026-11-12",
    sizeMb: 684,
    serverName: "WSUS-PRIMARY-01",
    targetGroup: "Domain Controllers",
    approvalStatus: "Approved",
  },
  {
    id: "patch-2",
    kb: "KB5046615",
    title: "2026-11 Cumulative Update for Windows Server 2019 (x64)",
    product: "Windows Server 2019",
    classification: "Cumulative Updates",
    releasedAt: "2026-11-12",
    sizeMb: 592,
    serverName: "WSUS-PRIMARY-01",
    targetGroup: "Database Servers",
    approvalStatus: "Not Approved",
  },
  {
    id: "patch-3",
    kb: "KB5046823",
    title: "Security Update for SQL Server 2019 GDR",
    product: "SQL Server 2019",
    classification: "Security Updates",
    releasedAt: "2026-11-12",
    sizeMb: 128,
    serverName: "WSUS-PRIMARY-01",
    targetGroup: "Database Servers",
    approvalStatus: "Not Approved",
  },
  {
    id: "patch-4",
    kb: "KB5046617",
    title: "2026-11 Cumulative Update for Windows 11 Version 24H2 (x64)",
    product: "Windows 11",
    classification: "Cumulative Updates",
    releasedAt: "2026-11-12",
    sizeMb: 712,
    serverName: "WSUS-BRANCH-EAST",
    targetGroup: "Finance Workstations",
    approvalStatus: "Approved",
  },
  {
    id: "patch-5",
    kb: "KB5046633",
    title: "2026-11 Cumulative Update for Windows 11 Version 23H2 (x64)",
    product: "Windows 11",
    classification: "Cumulative Updates",
    releasedAt: "2026-11-12",
    sizeMb: 698,
    serverName: "WSUS-BRANCH-EAST",
    targetGroup: "Engineering Workstations",
    approvalStatus: "Declined",
  },
  {
    id: "patch-6",
    kb: "KB5046400",
    title: "2026-11 Servicing Stack Update for Windows Server 2022",
    product: "Windows Server 2022",
    classification: "Critical Updates",
    releasedAt: "2026-11-12",
    sizeMb: 18,
    serverName: "WSUS-DMZ-01",
    targetGroup: "DMZ Web Tier",
    approvalStatus: "Not Approved",
  },
  {
    id: "patch-7",
    kb: "KB2267602",
    title: "Security Intelligence Update for Microsoft Defender Antivirus",
    product: "Microsoft Defender Antivirus",
    classification: "Definition Updates",
    releasedAt: "2026-11-22",
    sizeMb: 14,
    serverName: "WSUS-BRANCH-EAST",
    targetGroup: "All Computers",
    approvalStatus: "Approved",
  },
  {
    id: "patch-8",
    kb: "KB5046542",
    title: "2026-11 Security Update for .NET Framework 3.5 and 4.8.1",
    product: ".NET Framework",
    classification: "Security Updates",
    releasedAt: "2026-11-12",
    sizeMb: 64,
    serverName: "WSUS-PRIMARY-01",
    targetGroup: "Production Servers",
    approvalStatus: "Approved",
  },
];

export const wsusLogs: WsusLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-11-22 19:42:10",
    level: "Info",
    category: "Sync",
    source: "WSUS-PRIMARY-01",
    actor: "System",
    message:
      "Upstream synchronization completed (48 new updates, 12 revised).",
  },
  {
    id: "log-2",
    timestamp: "2026-11-22 19:30:04",
    level: "Error",
    category: "Client",
    source: "WKSTN-ENG-087.corp.local",
    actor: "WSUS Agent",
    message:
      "Failed to install KB5046633 (Windows 11 23H2 Cumulative Update) with error 0x800f0922.",
  },
  {
    id: "log-3",
    timestamp: "2026-11-22 19:15:22",
    level: "Warning",
    category: "Sync",
    source: "WSUS-DMZ-01",
    actor: "System",
    message:
      "Synchronization delayed: upstream catalog timeout after 30s; retry scheduled.",
  },
  {
    id: "log-4",
    timestamp: "2026-11-22 18:55:41",
    level: "Info",
    category: "Approval",
    source: "WSUS-PRIMARY-01",
    actor: "@admin",
    message:
      "Approved KB5046616 for target group Domain Controllers.",
  },
  {
    id: "log-5",
    timestamp: "2026-11-22 18:40:18",
    level: "Info",
    category: "Approval",
    source: "WSUS-BRANCH-EAST",
    actor: "@admin",
    message:
      "Declined KB5046633 for target group Engineering Workstations.",
  },
  {
    id: "log-6",
    timestamp: "2026-11-22 18:12:09",
    level: "Warning",
    category: "Client",
    source: "APP-ERP-02.corp.local",
    actor: "WSUS Agent",
    message:
      "Pending reboot required to complete installation of KB5046616.",
  },
  {
    id: "log-7",
    timestamp: "2026-11-22 17:45:00",
    level: "Info",
    category: "Server",
    source: "WSUS-BRANCH-EAST",
    actor: "System",
    message:
      "Downstream replica content cleanup completed (freed 4.2 GB).",
  },
  {
    id: "log-8",
    timestamp: "2026-11-22 17:10:33",
    level: "Info",
    category: "Auth",
    source: "Web Console",
    actor: "@admin",
    message: "User @admin signed in via credentials provider.",
  },
];

export const wsusClients: WsusClient[] = [
  {
    id: "cli-1",
    hostname: "DC-CORE-01.corp.local",
    ipAddress: "10.20.1.10",
    targetGroup: "Domain Controllers",
    os: "Windows Server 2022",
    status: "compliant",
    neededUpdates: 0,
    installedUpdates: 148,
    lastReported: "5 mins ago",
    serverName: "WSUS-PRIMARY-01",
    updates: [
      {
        kb: "KB5046616",
        title: "2026-11 Cumulative Update for Windows Server 2022 (x64)",
        classification: "Cumulative Update",
        status: "Installed",
        releasedAt: "2026-11-12",
        sizeMb: 684,
      },
      {
        kb: "KB5046400",
        title: "2026-11 Servicing Stack Update for Windows Server 2022",
        classification: "Critical Update",
        status: "Installed",
        releasedAt: "2026-11-12",
        sizeMb: 18,
      },
    ],
  },
  {
    id: "cli-2",
    hostname: "APP-ERP-02.corp.local",
    ipAddress: "10.20.2.44",
    targetGroup: "Production Servers",
    os: "Windows Server 2022",
    status: "pending_reboot",
    neededUpdates: 1,
    installedUpdates: 142,
    lastReported: "14 mins ago",
    serverName: "WSUS-PRIMARY-01",
    updates: [
      {
        kb: "KB5046616",
        title: "2026-11 Cumulative Update for Windows Server 2022 (x64)",
        classification: "Cumulative Update",
        status: "Pending Reboot",
        releasedAt: "2026-11-12",
        sizeMb: 684,
      },
      {
        kb: "KB5045594",
        title: "Security Update for .NET Framework 4.8 on Windows Server 2022",
        classification: "Security Update",
        status: "Installed",
        releasedAt: "2026-11-12",
        sizeMb: 42,
      },
    ],
  },
  {
    id: "cli-3",
    hostname: "SQL-PROD-01.corp.local",
    ipAddress: "10.20.2.81",
    targetGroup: "Database Servers",
    os: "Windows Server 2019",
    status: "needed",
    neededUpdates: 4,
    installedUpdates: 189,
    lastReported: "22 mins ago",
    serverName: "WSUS-PRIMARY-01",
    updates: [
      {
        kb: "KB5046615",
        title: "2026-11 Cumulative Update for Windows Server 2019 (x64)",
        classification: "Cumulative Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 592,
      },
      {
        kb: "KB5046823",
        title: "Security Update for SQL Server 2019 GDR",
        classification: "Security Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 128,
      },
      {
        kb: "KB2267602",
        title: "Security Intelligence Update for Microsoft Defender Antivirus",
        classification: "Definition Update",
        status: "Installed",
        releasedAt: "2026-11-22",
        sizeMb: 14,
      },
    ],
  },
  {
    id: "cli-4",
    hostname: "WKSTN-FIN-104.corp.local",
    ipAddress: "10.30.12.104",
    targetGroup: "Finance Workstations",
    os: "Windows 11 24H2",
    status: "compliant",
    neededUpdates: 0,
    installedUpdates: 94,
    lastReported: "9 mins ago",
    serverName: "WSUS-BRANCH-EAST",
    updates: [
      {
        kb: "KB5046617",
        title: "2026-11 Cumulative Update for Windows 11 Version 24H2 (x64)",
        classification: "Cumulative Update",
        status: "Installed",
        releasedAt: "2026-11-12",
        sizeMb: 712,
      },
    ],
  },
  {
    id: "cli-5",
    hostname: "WKSTN-ENG-087.corp.local",
    ipAddress: "10.30.14.87",
    targetGroup: "Engineering Workstations",
    os: "Windows 11 23H2",
    status: "failed",
    neededUpdates: 3,
    installedUpdates: 88,
    lastReported: "1 hour ago",
    serverName: "WSUS-BRANCH-EAST",
    updates: [
      {
        kb: "KB5046633",
        title: "2026-11 Cumulative Update for Windows 11 Version 23H2 (x64)",
        classification: "Cumulative Update",
        status: "Failed",
        releasedAt: "2026-11-12",
        sizeMb: 698,
      },
      {
        kb: "KB5046542",
        title: "2026-11 Cumulative Update for .NET Framework 3.5 and 4.8.1",
        classification: "Security Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 64,
      },
    ],
  },
  {
    id: "cli-6",
    hostname: "WEB-DMZ-03.dmz.local",
    ipAddress: "172.16.8.33",
    targetGroup: "DMZ Web Tier",
    os: "Windows Server 2022",
    status: "needed",
    neededUpdates: 2,
    installedUpdates: 131,
    lastReported: "42 mins ago",
    serverName: "WSUS-DMZ-01",
    updates: [
      {
        kb: "KB5046616",
        title: "2026-11 Cumulative Update for Windows Server 2022 (x64)",
        classification: "Cumulative Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 684,
      },
      {
        kb: "KB5046400",
        title: "2026-11 Servicing Stack Update for Windows Server 2022",
        classification: "Critical Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 18,
      },
    ],
  },
  {
    id: "cli-7",
    hostname: "LEGACY-POS-12.corp.local",
    ipAddress: "10.30.19.12",
    targetGroup: "Retail Endpoints",
    os: "Windows 10 22H2",
    status: "offline",
    neededUpdates: 7,
    installedUpdates: 112,
    lastReported: "34 days ago",
    serverName: "WSUS-BRANCH-EAST",
    updates: [
      {
        kb: "KB5046613",
        title: "2026-11 Cumulative Update for Windows 10 Version 22H2 (x64)",
        classification: "Cumulative Update",
        status: "Needed",
        releasedAt: "2026-11-12",
        sizeMb: 640,
      },
      {
        kb: "KB5044273",
        title: "2026-10 Cumulative Update for Windows 10 Version 22H2 (x64)",
        classification: "Cumulative Update",
        status: "Needed",
        releasedAt: "2026-10-08",
        sizeMb: 632,
      },
    ],
  },
  {
    id: "cli-8",
    hostname: "FILE-SRV-01.corp.local",
    ipAddress: "10.20.3.25",
    targetGroup: "Storage Servers",
    os: "Windows Server 2022",
    status: "compliant",
    neededUpdates: 0,
    installedUpdates: 151,
    lastReported: "18 mins ago",
    serverName: "WSUS-PRIMARY-01",
    updates: [
      {
        kb: "KB5046616",
        title: "2026-11 Cumulative Update for Windows Server 2022 (x64)",
        classification: "Cumulative Update",
        status: "Installed",
        releasedAt: "2026-11-12",
        sizeMb: 684,
      },
    ],
  },
];
