import { z } from "zod";
import { V5_STORE } from "../../shared/vampire-v5";
import { createCampaignShoppingListForUser, createCampaignShoppingListShareLinkForUser, getSharedCampaignShoppingListByToken, listCampaignShoppingListsForUser, removeCampaignShoppingListForUser, setCampaignShoppingListItemAcquiredForUser, setCampaignShoppingListItemForUser } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const listId = z.object({ listId: z.number().int().positive() });
const itemId = z.string().trim().min(1).max(120);

export const shoppingListsRouter = router({
  mine: protectedProcedure.query(({ ctx }) => listCampaignShoppingListsForUser(ctx.user.id)),
  create: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), title: z.string().trim().min(2).max(120) })).mutation(({ ctx, input }) => createCampaignShoppingListForUser({ ownerId: ctx.user.id, ...input })),
  remove: protectedProcedure.input(listId).mutation(({ ctx, input }) => removeCampaignShoppingListForUser({ ownerId: ctx.user.id, ...input })),
  setItem: protectedProcedure.input(listId.extend({ itemId, included: z.boolean() })).mutation(({ ctx, input }) => {
    if (!V5_STORE.some((item) => item.id === input.itemId)) throw new Error("O item informado não pertence ao catálogo atual.");
    return setCampaignShoppingListItemForUser({ ownerId: ctx.user.id, ...input });
  }),
  setItemAcquired: protectedProcedure.input(listId.extend({ itemId, acquired: z.boolean() })).mutation(({ ctx, input }) => setCampaignShoppingListItemAcquiredForUser({ ownerId: ctx.user.id, ...input })),
  createShareLink: protectedProcedure.input(listId).mutation(({ ctx, input }) => createCampaignShoppingListShareLinkForUser({ ownerId: ctx.user.id, ...input })),
  sharedByToken: publicProcedure.input(z.object({ token: z.string().min(20).max(72) })).query(({ input }) => getSharedCampaignShoppingListByToken(input.token)),
});
