import { z } from "zod";
import { createCharacterForUser, createCharacterShareLinkForUser, getCharacterShareLinkStatusForUser, getSharedCharacterByToken, listCharactersForUser, listDiceRollsForCharacterUser, recordDiceRollForUser, revokeCharacterShareLinkForUser, updateCharacterForUser } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const systemId = z.enum(["vampiro-v5", "o-um-anel", "cacador-a-vinganca"]);

export const charactersRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listCharactersForUser(ctx.user.id)),
  create: protectedProcedure.input(z.object({
    systemId,
    name: z.string().trim().min(2).max(160),
    concept: z.string().trim().max(255).optional(),
    campaignId: z.number().int().positive().nullable().optional(),
    sheetData: z.record(z.string(), z.unknown()),
  })).mutation(({ ctx, input }) => createCharacterForUser({ ownerId: ctx.user.id, ...input })),
  update: protectedProcedure.input(z.object({
    characterId: z.number().int().positive(),
    name: z.string().trim().min(2).max(160),
    concept: z.string().trim().max(255).optional(),
    campaignId: z.number().int().positive().nullable().optional(),
    sheetData: z.record(z.string(), z.unknown()),
  })).mutation(({ ctx, input }) => updateCharacterForUser({ ownerId: ctx.user.id, ...input })),
  recordRoll: protectedProcedure.input(z.object({
    systemId,
    characterId: z.number().int().positive().nullable().optional(),
    campaignId: z.number().int().positive().nullable().optional(),
    context: z.string().trim().max(255).optional(),
    resultData: z.record(z.string(), z.unknown()),
  })).mutation(({ ctx, input }) => recordDiceRollForUser({ rollerId: ctx.user.id, ...input })),
  rollHistory: protectedProcedure.input(z.object({ characterId: z.number().int().positive() })).query(({ ctx, input }) => listDiceRollsForCharacterUser({ rollerId: ctx.user.id, ...input })),
  createShareLink: protectedProcedure.input(z.object({ characterId: z.number().int().positive(), expiresAt: z.date().refine((value) => value > new Date(), "A expiração deve estar no futuro.").nullable().optional(), label: z.string().trim().max(120).nullable().optional(), description: z.string().trim().max(1000).nullable().optional() })).mutation(({ ctx, input }) => createCharacterShareLinkForUser({ ownerId: ctx.user.id, ...input })),
  shareLinkStatus: protectedProcedure.input(z.object({ characterId: z.number().int().positive() })).query(({ ctx, input }) => getCharacterShareLinkStatusForUser({ ownerId: ctx.user.id, ...input })),
  revokeShareLink: protectedProcedure.input(z.object({ characterId: z.number().int().positive() })).mutation(({ ctx, input }) => revokeCharacterShareLinkForUser({ ownerId: ctx.user.id, ...input })),
  sharedByToken: publicProcedure.input(z.object({ token: z.string().min(20).max(96) })).query(({ input }) => getSharedCharacterByToken(input.token)),
});
