import { z } from "zod";
import { createCharacterForUser, listCharactersForUser, recordDiceRollForUser, updateCharacterForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const systemId = z.enum(["vampiro-v5", "o-um-anel"]);

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
});
