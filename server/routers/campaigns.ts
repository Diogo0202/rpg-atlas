import { z } from "zod";
import { addCampaignMemberForOwner, createCampaignFactionForUser, createCampaignForUser, createCampaignSessionForUser, listCampaignFactionsForUser, listCampaignMembersForOwner, listCampaignsForUser, listCampaignSessionsForUser, removeCampaignMemberForOwner, updateCampaignFactionTensionForUser, updateCampaignMemberRoleForOwner, updateCampaignSessionForUser } from "../db";
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
  updateSession: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), sessionId: z.number().int().positive(), title: z.string().trim().min(3).max(160), summary: z.string().trim().max(4000).optional(), status: z.enum(["planned", "played", "archived"]) })).mutation(({ ctx, input }) => updateCampaignSessionForUser({ userId: ctx.user.id, ...input })),
  members: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignMembersForOwner({ ownerId: ctx.user.id, ...input })),
  addMember: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), email: z.string().trim().email().max(320), role: z.enum(["narrator", "player", "observer"]).default("player") })).mutation(({ ctx, input }) => addCampaignMemberForOwner({ ownerId: ctx.user.id, ...input })),
  updateMemberRole: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), userId: z.number().int().positive(), role: z.enum(["narrator", "player", "observer"]) })).mutation(({ ctx, input }) => updateCampaignMemberRoleForOwner({ ownerId: ctx.user.id, ...input })),
  removeMember: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), userId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCampaignMemberForOwner({ ownerId: ctx.user.id, ...input })),
  factions: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignFactionsForUser({ userId: ctx.user.id, ...input })),
  createFaction: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), name: z.string().trim().min(3).max(160), description: z.string().trim().max(4000).optional(), objective: z.string().trim().max(255).optional(), maxTension: z.number().int().min(3).max(12).default(6), ruptureConsequence: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => createCampaignFactionForUser({ userId: ctx.user.id, ...input })),
  setFactionTension: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), factionId: z.number().int().positive(), tension: z.number().int().min(-12).max(24) })).mutation(({ ctx, input }) => updateCampaignFactionTensionForUser({ userId: ctx.user.id, ...input })),
});
