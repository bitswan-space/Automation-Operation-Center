"use client";

import * as React from "react";

import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";
import { CreateOrgDialog } from "./create-org-dialog";
import { type Organisation } from "@/server/actions/mqtt-profiles";

export function OrgSwitcher({
  orgs: orgs,
}: {
  orgs: Organisation[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(orgs[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] bg-neutral-100">
          <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-3" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={"bottom"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Organizations
        </DropdownMenuLabel>
        {orgs.map((team) => {
          return (
            <DropdownMenuItem
              key={team.id}
              onClick={() => setActiveTeam(team)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <GalleryVerticalEnd className="size-3.5 shrink-0" />
              </div>
              {team.name}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />

            <CreateOrgDialog />

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
