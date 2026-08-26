import { z } from "zod";
import { createCharacterArchetypeForUser, deleteCharacterArchetypeForUser, listCharacterArchetypesForUser, updateCharacterArchetypeForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const systemId = z.enum(["vampiro-v5", "o-um-anel"]);

export const archetypesRouter = router({
  mine: protectedProcedure.input(z.object({ systemId }).optional()).query(({ ctx, input }) => listCharacterArchetypesForUser(ctx.user.id, input?.systemId)),
  create: protectedProcedure.input(z.object({ systemId, title: z.string().trim().min(2).max(120), summary: z.string().trim().max(500).optional(), payload: z.record(z.string(), z.unknown()) })).mutation(({ ctx, input }) => createCharacterArchetypeForUser({ ownerId: ctx.user.id, ...input })),
  update: protectedProcedure.input(z.object({ archetypeId: z.number().int().positive(), title: z.string().trim().min(2).max(120), summary: z.string().trim().max(500).optional(), payload: z.record(z.string(), z.unknown()) })).mutation(({ ctx, input }) => updateCharacterArchetypeForUser({ ownerId: ctx.user.id, ...input })),
  remove: protectedProcedure.input(z.object({ archetypeId: z.number().int().positive() })).mutation(({ ctx, input }) => deleteCharacterArchetypeForUser({ ownerId: ctx.user.id, archetypeId: input.archetypeId })),
});
