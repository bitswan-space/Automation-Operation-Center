import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clipboard, Workflow } from "lucide-react";
import { type PipelineWithStats } from "@/types";

import { PipelineTopologyDisplay } from "./topology/PipelineTopologyDisplay";
import {
  transformTopologyToFlowNodes,
  transformTopologyToFlowEdges,
} from "@/utils/reactflow";

import { usePipelineTopology } from "./hooks/usePipelineTopology";
import { PipelineSummary } from "./PipelineSummary";

import { useRouter, usePathname } from 'next/navigation';

export interface PipelineDetailTabsProps {
  pipeline?: PipelineWithStats;
  pipelineParentIDs: string[];
  automationServerId: string;
  workspaceId: string;
}

export function PipelineDetailTabs(props: PipelineDetailTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { pipeline, pipelineParentIDs, automationServerId, workspaceId } = props;

  const { pipelineTopology } = usePipelineTopology({
    automationServerId,
    workspaceId,
    componentIDs: pipelineParentIDs,
  });

  const [selectedTab, setSelectedTab] = React.useState("summary");

  const handlePipelineTopologyClick = () => {
    if (pipelineTopology[0]?.capabilities?.includes("has-children")) {
      router.push(`${pathname}/${pipelineTopology[0].id}`);
    }
    else setSelectedTab("scheme");
  };

  return (
    <Tabs
      defaultValue={selectedTab}
      value={selectedTab}
      className="h-full w-full"
    >
      <TabsList className="grid grid-cols-2 bg-neutral-300 md:w-[400px]">
        <TabsTrigger
          value="summary"
          className=""
          onClick={() => setSelectedTab("summary")}
        >
          <Clipboard size={18} className="mr-2" />
          Summary
        </TabsTrigger>
        <TabsTrigger value="scheme" onClick={() => setSelectedTab("scheme")}>
          <Workflow size={18} className="mr-2" />
          Scheme
        </TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <PipelineSummary
          pipeline={pipeline}
          pipelineTopology={pipelineTopology ?? []}
          onClickPipelineTopology={handlePipelineTopologyClick}
        />
      </TabsContent>
      <TabsContent value="scheme" className="h-5/6">
        <Card className="h-full rounded-md">
          <CardHeader>
            <CardTitle>Topology</CardTitle>
          </CardHeader>
          <CardContent className="h-5/6 w-full space-y-2 p-2">
            <PipelineTopologyDisplay
              automationServerId={automationServerId}
              workspaceId={workspaceId}
              initialNodes={transformTopologyToFlowNodes(
                pipelineTopology ?? [],
              )}
              initialEdges={transformTopologyToFlowEdges(
                pipelineTopology ?? [],
              )}
              pipelineParentIDs={pipelineParentIDs}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
