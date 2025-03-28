// pages/api/logout.ts (or another appropriate name)

import { type NextApiRequest, type NextApiResponse } from "next";

import { env } from "@/env.mjs";
import { auth } from "@/server/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await auth();

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const KEYCLOAK_END_SESSION_URL = env.KEYCLOAK_END_SESSION_URL;
    const KEYCLOAK_POST_LOGOUT_REDIRECT_URI =
      env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI;

    const idToken = session.id_token;
    const url = `${KEYCLOAK_END_SESSION_URL}?id_token_hint=${idToken}&post_logout_redirect_uri=${KEYCLOAK_POST_LOGOUT_REDIRECT_URI}`;

    try {
      await fetch(url, { method: "GET" });
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
