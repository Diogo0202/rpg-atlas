import { COOKIE_NAME } from "@shared/const";
import { campaignsRouter } from "./routers/campaigns";
import { archetypesRouter } from "./routers/archetypes";
import { charactersRouter } from "./routers/characters";
import { libraryRouter } from "./routers/library";
import { hunterCellsRouter } from "./routers/hunterCells";
import { mapsRouter } from "./routers/maps";
import { musicRouter } from "./routers/music";
import { systemsRouter } from "./routers/systems";
import { storeRouter } from "./routers/store";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  systems: systemsRouter,
  campaigns: campaignsRouter,
  characters: charactersRouter,
  archetypes: archetypesRouter,
  library: libraryRouter,
  hunterCells: hunterCellsRouter,
  maps: mapsRouter,
  music: musicRouter,
  store: storeRouter,
});

export type AppRouter = typeof appRouter;
