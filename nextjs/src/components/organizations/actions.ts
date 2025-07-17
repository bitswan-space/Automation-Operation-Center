"use server";

import { AppError } from "@/lib/errors";
import { authenticatedActionClient } from "@/lib/safe-action";
import { createOrg } from "@/server/actions/mqtt-profiles";
import z from "zod";
import { zfd } from "zod-form-data";

export const createOrgAction = authenticatedActionClient
  .metadata({
    actionName: "createOrgAction",
  })
  .inputSchema(
    zfd.formData({
      name: z.string(),
    }),
  )
  .action(async ({ parsedInput: { name }, ctx: { session } }) => {
    const res = await createOrg(session, name);
    if ("status" in res && res.status === "error") {
      throw new AppError({
        name: "createOrgAction",
        code: "CREATE_ORG_ERROR",
        message: res.message,
      });
    }
    return res;
  });
