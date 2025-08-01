"use client";

import { ArrowLeft, ArrowUpRight, Server, Users, Zap } from "lucide-react";
import { VscVscode } from "react-icons/vsc";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { type AutomationServer } from "@/data/automation-server";
import { formatRelative } from "date-fns";
import { PipelineDataCardList } from "../pipeline/PipelineDataCardList";
import { PipelineDataTable } from "../pipeline/PipelineDataTable";
import { useAutomations } from "@/context/AutomationsProvider";
import { useRouter } from "next/navigation";

type AutomationServerDetailSectionProps = {
  server?: AutomationServer;
};

export function AutomationServerDetailSection(
  props: AutomationServerDetailSectionProps,
) {
  const { server } = props;

  const router = useRouter();
  const { automationServers } = useAutomations();

  if (!server) {
    router.push("/dashboard/automation-servers");
  } else {
    server.is_connected = true;
  }

  const automationServerPipelines =
    automationServers[server?.automation_server_id ?? ""];

  return (
    <div className="container mx-auto flex-1 px-0 py-4">
      <header className="rounded-md border border-slate-300 bg-white p-4 px-0 shadow-sm">
        <div className="container mx-auto">
          <div className="mb-4 flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/dashboard/automation-servers">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to servers
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-blue-600">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {server?.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    {server?.workspaces?.length} workspace
                    {(server?.workspaces?.length ?? 0) > 1 && "s"}
                  </span>
                  <span>•</span>
                  <span>
                    {automationServerPipelines?.pipelines.length ?? 0}{" "}
                    automations
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {server?.is_connected ? (
                <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
                  Connected
                </Badge>
              ) : (
                <Badge className="border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100">
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>
      <Tabs defaultValue="workspaces" className="mt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="workspaces" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Workspaces ({server?.workspaces?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Automations ({automationServerPipelines?.pipelines.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces">
          <Card className="rounded-md border border-slate-300 shadow-none">
            <CardHeader>
              <CardTitle>Workspaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-gray-100 text-gray-600">
                    <TableRow>
                      <TableHead>Name</TableHead>

                      <TableHead className="text-center">Automations</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server?.workspaces?.map((workspace) => (
                      <TableRow key={workspace.id}>
                        <TableCell className="items-center text-blue-600 underline underline-offset-2">
                          <Link
                            className="flex items-center gap-1"
                            href={`/dashboard/automation-servers/${server.automation_server_id}/workspaces/${workspace.id}`}
                          >
                            {workspace.name}
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {automationServerPipelines?.workspaces[workspace.id]
                            ?.pipelines.length ?? 0}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRelative(
                            new Date(workspace.created_at),
                            new Date(),
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {workspace.editor_url && (
                            <Link href={workspace.editor_url} target="_blank">
                              <Button variant="outline" size="icon">
                                <VscVscode size={20} />
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations">
          <PipelineDataCardList
            pipelines={automationServerPipelines?.pipelines ?? []}
          />
          <div className="hidden py-4 lg:block">
            <Card
              className={
                "h-full w-full rounded-md border border-slate-300 shadow-sm"
              }
            >
              <CardContent className="p-3">
                <PipelineDataTable
                  pipelines={automationServerPipelines?.pipelines ?? []}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
