import { z } from "zod";
import { createAntagonistForUser, linkAntagonistToCharacter, linkAntagonistToSession, listAntagonists, listAntagonistsForUser, listSourceDocuments, searchLibraryContext, updateAntagonistForUser } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const systemId = z.enum(["vampiro-v5", "o-um-anel"]);
const creatureType = z.enum(["vampire", "werewolf", "mage", "mortal", "faction", "entity", "other"]);
const threatLevel = z.enum(["minor", "moderate", "major", "critical", "cataclysmic"]);
const antagonistInput = z.object({ campaignId: z.number().int().positive().nullable().optional(), systemId, name: z.string().trim().min(2).max(160), creatureType, threatLevel, summary: z.string().trim().min(12).max(6000), hooks: z.array(z.string().trim().min(2).max(300)).min(1).max(6) });

export const libraryRouter = router({
  antagonists: publicProcedure.input(z.object({ systemId: systemId.optional(), creatureType: creatureType.optional(), threatLevel: threatLevel.optional() }).optional()).query(({ input }) => listAntagonists(input)),
  sources: publicProcedure.query(() => listSourceDocuments()),
  mine: protectedProcedure.input(z.object({ campaignId: z.number().int().positive().optional(), systemId: systemId.optional() }).optional()).query(({ ctx, input }) => listAntagonistsForUser(ctx.user.id, input)),
  create: protectedProcedure.input(antagonistInput).mutation(({ ctx, input }) => createAntagonistForUser({ ownerId: ctx.user.id, ...input })),
  update: protectedProcedure.input(antagonistInput.extend({ antagonistId: z.number().int().positive() })).mutation(({ ctx, input }) => updateAntagonistForUser({ ownerId: ctx.user.id, ...input })),
  linkSession: protectedProcedure.input(z.object({ antagonistId: z.number().int().positive(), sessionId: z.number().int().positive(), role: z.enum(["rumor", "presence", "confrontation", "aftermath"]), notes: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => linkAntagonistToSession({ ownerId: ctx.user.id, ...input })),
  linkCharacter: protectedProcedure.input(z.object({ antagonistId: z.number().int().positive(), characterId: z.number().int().positive(), relation: z.enum(["enemy", "rival", "target", "ally", "patron", "debt"]), notes: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => linkAntagonistToCharacter({ ownerId: ctx.user.id, ...input })),
  search: publicProcedure.input(z.object({ query: z.string().trim().min(2).max(120) })).query(({ input }) => searchLibraryContext(input.query)),
});
