"use server";

import { BITSWAN_BACKEND_API_URL } from "./shared";

import { type Session } from "next-auth";
import { signOut } from "../auth";
import { type RawNavItem } from "@/components/layout/Sidebar/utils/NavItems";

export type MQTTProfile = {
  id: string;
  name: string;
  group_id: string;
  is_admin: string;
  nav_items: RawNavItem[];
};
export type MQTTProfileListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MQTTProfile[];
};

export const fetchMQTTProfiles = async (session: Session | null) => {
  if (!session) {
    await signOut();
  }

  const apiToken = session?.access_token;

  const res = await fetch(
    `${BITSWAN_BACKEND_API_URL}/user-groups/mqtt_profiles`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    console.error("Error fetching MQTT profiles", res);

    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }

  const jsonData = (await res.json()) as unknown;
  console.log("jsonData", jsonData);
  const data = jsonData as MQTTProfileListResponse;

  return data;
};
