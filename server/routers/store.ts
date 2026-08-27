import { z } from "zod";
import { V5_STORE } from "../../shared/vampire-v5";
import { listStoreFavoritesForUser, setStoreFavoriteForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const storeItemInput = z.object({ itemId: z.string().trim().min(1).max(120) });

export const storeRouter = router({
  favorites: protectedProcedure.query(({ ctx }) => listStoreFavoritesForUser(ctx.user.id)),
  setFavorite: protectedProcedure.input(storeItemInput.extend({ favorite: z.boolean() })).mutation(({ ctx, input }) => {
    if (!V5_STORE.some((item) => item.id === input.itemId)) throw new Error("O item informado não pertence ao catálogo atual.");
    return setStoreFavoriteForUser({ ownerId: ctx.user.id, ...input });
  }),
});
