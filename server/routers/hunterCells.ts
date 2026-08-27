import { z } from "zod";
import { configureHunterCellForUser, createHunterCellForUser, listHunterCellsForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const idList = z.array(z.number().int().positive()).max(30);

export const hunterCellsRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listHunterCellsForUser(ctx.user.id)),
  create: protectedProcedure.input(z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1200).optional(),
    campaignId: z.number().int().positive().nullable().optional(),
  })).mutation(({ ctx, input }) => createHunterCellForUser({ ownerId: ctx.user.id, ...input })),
  configure: protectedProcedure.input(z.object({
    cellId: z.number().int().positive(),
    campaignId: z.number().int().positive().nullable().optional(),
    characterIds: idList,
    antagonistIds: idList,
  })).mutation(({ ctx, input }) => configureHunterCellForUser({ ownerId: ctx.user.id, ...input })),
});
