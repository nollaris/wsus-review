"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { LogOutIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WsusSettingsView() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [domainName, setDomainName] = React.useState("corp.local");
  const [staleClientDays, setStaleClientDays] = React.useState("30");
  const [defaultSyncHours, setDefaultSyncHours] = React.useState("12");
  const [autoApproveDefinitions, setAutoApproveDefinitions] =
    React.useState(true);
  const [autoApproveWorkstations, setAutoApproveWorkstations] =
    React.useState(false);
  const [requireServerApproval, setRequireServerApproval] =
    React.useState(true);

  function handleSaveGeneral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("General settings saved");
  }

  function handleSavePolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Sync and approval policy saved");
  }

  return (
    <Tabs defaultValue="general" className="min-w-0 gap-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="policy">Sync &amp; Policy</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <form onSubmit={handleSaveGeneral}>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure environment display preferences and client reporting
                thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="domain-name">
                    Active Directory / WSUS Domain
                  </FieldLabel>
                  <Input
                    id="domain-name"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="corp.local"
                    required
                  />
                  <FieldDescription>
                    Default domain suffix used when displaying managed hosts.
                  </FieldDescription>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Appearance Theme</FieldLabel>
                    <Select
                      value={theme ?? "system"}
                      onValueChange={(value) => {
                        if (value) setTheme(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="stale-days">
                      Offline Client Threshold (days)
                    </FieldLabel>
                    <Input
                      id="stale-days"
                      type="number"
                      min={1}
                      max={365}
                      value={staleClientDays}
                      onChange={(e) => setStaleClientDays(e.target.value)}
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
            <CardFooter className="mt-6 justify-end border-t pt-4">
              <Button type="submit">
                <SaveIcon className="size-4" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="policy">
        <Card>
          <form onSubmit={handleSavePolicy}>
            <CardHeader>
              <CardTitle>Sync &amp; Approval Policy</CardTitle>
              <CardDescription>
                Default WSUS synchronization interval and patch approval rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <FieldGroup>
                <Field className="max-w-xs">
                  <FieldLabel>Default Interval Time Sync</FieldLabel>
                  <Select
                    value={defaultSyncHours}
                    onValueChange={(value) => {
                      if (value) setDefaultSyncHours(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1 hour</SelectItem>
                      <SelectItem value="4">Every 4 hours</SelectItem>
                      <SelectItem value="6">Every 6 hours</SelectItem>
                      <SelectItem value="12">Every 12 hours</SelectItem>
                      <SelectItem value="24">Every 24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="auto-def"
                    checked={autoApproveDefinitions}
                    onCheckedChange={(checked) =>
                      setAutoApproveDefinitions(Boolean(checked))
                    }
                  />
                  <FieldLabel htmlFor="auto-def" className="cursor-pointer">
                    Auto-approve Microsoft Defender definition updates
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="auto-wkstn"
                    checked={autoApproveWorkstations}
                    onCheckedChange={(checked) =>
                      setAutoApproveWorkstations(Boolean(checked))
                    }
                  />
                  <FieldLabel htmlFor="auto-wkstn" className="cursor-pointer">
                    Auto-approve Security &amp; Critical updates for workstation
                    groups
                  </FieldLabel>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="manual-srv"
                    checked={requireServerApproval}
                    onCheckedChange={(checked) =>
                      setRequireServerApproval(Boolean(checked))
                    }
                  />
                  <FieldLabel htmlFor="manual-srv" className="cursor-pointer">
                    Require manual approval for Production &amp; Database server
                    groups
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="mt-6 justify-end border-t pt-4">
              <Button type="submit">
                <SaveIcon className="size-4" />
                Save Policy
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Signed-In Account</CardTitle>
            <CardDescription>
              Current Auth.js session details for this browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Display Name</span>
              <span className="font-medium">
                {session?.user?.name ?? "Administrator"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Username</span>
              <span className="font-mono text-xs font-medium">
                @{session?.user?.username ?? "admin"}
              </span>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOutIcon className="size-4" />
              Log out
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
