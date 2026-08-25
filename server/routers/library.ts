import { z } from "zod";
import { listAntagonists, listSourceDocuments } from "../db";
import { publicProcedure, router } from "../_core/trpc";

const systemId = z.enum(["vampiro-v5", "o-um-anel"]);
const creatureType = z.enum(["vampire", "werewolf", "mage", "mortal", "faction", "entity", "other"]);
const threatLevel = z.enum(["minor", "moderate", "major", "critical", "cataclysmic"]);

export const libraryRouter = router({
  antagonists: publicProcedure.input(z.object({ systemId: systemId.optional(), creatureType: creatureType.optional(), threatLevel: threatLevel.optional() }).optional()).query(({ input }) => listAntagonists(input)),
  sources: publicProcedure.query(() => listSourceDocuments()),
});
