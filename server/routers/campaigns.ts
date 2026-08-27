import { z } from "zod";
import { addCampaignMemberForOwner, createCampaignEventForUser, createCampaignFactionForUser, createCampaignForUser, createCampaignSessionForUser, listCampaignEventsForUser, listCampaignFactionsForUser, listCampaignMembersForOwner, listCampaignsForUser, listCampaignSessionsForUser, removeCampaignMemberForOwner, updateCampaignEventForUser, updateCampaignFactionTensionForUser, updateCampaignMemberRoleForOwner, updateCampaignSessionForUser } from "../db";
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
  events: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignEventsForUser({ userId: ctx.user.id, ...input })),
  createEvent: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), sessionId: z.number().int().positive().nullable().optional(), title: z.string().trim().min(3).max(160), description: z.string().trim().max(4000).optional(), status: z.enum(["planned", "active", "resolved", "failed", "consequence"]).default("active"), occurredAt: z.date().optional() })).mutation(({ ctx, input }) => createCampaignEventForUser({ userId: ctx.user.id, ...input })),
  updateEvent: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), eventId: z.number().int().positive(), sessionId: z.number().int().positive().nullable().optional(), title: z.string().trim().min(3).max(160), description: z.string().trim().max(4000).optional(), status: z.enum(["planned", "active", "resolved", "failed", "consequence"]), occurredAt: z.date() })).mutation(({ ctx, input }) => updateCampaignEventForUser({ userId: ctx.user.id, ...input })),
});
