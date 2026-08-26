import { z } from "zod";
import { createCampaignForUser, createCampaignSessionForUser, listCampaignsForUser, listCampaignSessionsForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const campaignsRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listCampaignsForUser(ctx.user.id)),
  create: protectedProcedure.input(z.object({
    systemId: z.enum(["vampiro-v5", "o-um-anel", "cacador-a-vinganca"]),
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().max(4000).optional(),
  })).mutation(({ ctx, input }) => createCampaignForUser({ ownerId: ctx.user.id, ...input })),
  sessions: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignSessionsForUser(input.campaignId, ctx.user.id)),
  createSession: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), title: z.string().trim().min(3).max(160), summary: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => createCampaignSessionForUser({ userId: ctx.user.id, ...input })),
});
