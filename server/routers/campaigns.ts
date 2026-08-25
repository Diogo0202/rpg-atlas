import { z } from "zod";
import { createCampaignForUser, listCampaignsForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const campaignsRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listCampaignsForUser(ctx.user.id)),
  create: protectedProcedure.input(z.object({
    systemId: z.enum(["vampiro-v5", "o-um-anel"]),
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().max(4000).optional(),
  })).mutation(({ ctx, input }) => createCampaignForUser({ ownerId: ctx.user.id, ...input })),
});
