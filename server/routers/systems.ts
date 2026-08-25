import { listRpgSystems } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const systemsRouter = router({
  list: publicProcedure.query(() => listRpgSystems()),
});
