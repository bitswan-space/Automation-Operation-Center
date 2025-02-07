"use server";

import { BITSWAN_BACKEND_API_URL } from "./shared";

import { type Session } from "next-auth";
import { unstable_cache as cache } from "next/cache";
import { signOut } from "../auth";
import { type RawNavItem } from "@/components/layout/Sidebar/utils/NavItems";

const MQTT_PROFILES_CACHE_KEY = "mqtt-profiles";

export type MQTTProfile = {
  id: string;
  name: string;
  group_id: string;
  isAdmin: string;
  nav_items: RawNavItem[];
};
export type MQTTProfileListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MQTTProfile[];
};

export const fetchMQTTProfiles = cache(
  async (session: Session | null) => {
    if (!session) {
      await signOut();
    }

    const apiToken = session?.access_token;

    const res = await fetch(
      `${BITSWAN_BACKEND_API_URL}/user-groups/mqtt_profiles`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!res.ok) {
      console.error("Error fetching MQTT profiles", res);

      throw new Error("Error fetching MQTT profiles");
    }

    const data = (await res.json()) as MQTTProfileListResponse;

    return data;
  },
  [],
  {
    tags: [MQTT_PROFILES_CACHE_KEY],
  },
);
