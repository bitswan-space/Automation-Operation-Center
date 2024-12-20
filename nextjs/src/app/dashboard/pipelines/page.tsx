"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import { PipelineDataTable } from "@/components/pipeline/PipelineDataTable";
import { PipelineDataCard } from "@/components/pipeline/PipelineDataCard";

import { type PipelineWithStats } from "@/types";
import { usePipelinesWithStats } from "@/components/pipeline/hooks/usePipelinesWithStats";
import { TitleBar } from "@/components/layout/TitleBar";

const DashboardPage = () => {
  const { pipelinesWithStats: pipelines } = usePipelinesWithStats();

  console.log("pipelines", pipelines);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-stone-700 md:hidden">
        Pipeline Containers
      </h1>
      <TitleBar title="Pipeline Containers" />
      <div className="flex py-4 pt-6 lg:hidden">
        <Input
          placeholder="Find pipeline"
          className="rounded-r-none bg-white"
        />
        <Button type="submit" className="my-auto rounded-l-none bg-stone-800">
          Search
        </Button>
      </div>

      <PipelineDataCardList pipelines={pipelines} />
      <div className="hidden py-4 lg:block">
        <Card
          className={
            "h-full w-full rounded-md border border-slate-300 shadow-sm"
          }
        >
          <CardContent className="p-3">
            <PipelineDataTable pipelines={pipelines} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

type PipelineDataCardListProps = {
  pipelines?: PipelineWithStats[];
};

function PipelineDataCardList(props: Readonly<PipelineDataCardListProps>) {
  const { pipelines } = props;

  return (
    <div className="flex flex-col gap-2 md:pt-2 lg:hidden">
      {pipelines?.map((pipeline) => (
        <div key={pipeline._key}>
          <PipelineDataCard
            id={pipeline._key}
            key={pipeline.properties["container-id"]}
            name={pipeline.properties.name}
            machineName={pipeline.properties["endpoint-name"]}
            dateCreated={pipeline.properties["created-at"]}
            status={pipeline.properties.state}
            uptime={pipeline.properties.status}
          />
        </div>
      ))}
    </div>
  );
}
