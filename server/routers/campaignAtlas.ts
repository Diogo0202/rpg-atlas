import { z } from "zod";
import {
  listCampaignAtlasForUser,
  listCampaignBlessingsForUser,
  removeCampaignAtlasEncounterForUser,
  saveCampaignAtlasEncounterForUser,
  saveCampaignAtlasStateForUser,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const jsonRecord = z.record(z.string(), z.unknown());
const stateInput = z.object({
  campaignId: z.number().int().positive(),
  mapKey: z.string().trim().min(1).max(96),
  title: z.string().trim().min(3).max(160),
  tension: z.number().int().min(0).max(6),
  selectedRegion: z.string().trim().min(1).max(96),
  resolvedEncounterIds: z.array(z.string().trim().min(1).max(96)).max(200),
  customRegions: z.array(jsonRecord).max(100),
  customRoutes: z.array(jsonRecord).max(200),
});

const encounterInput = z.object({
  campaignId: z.number().int().positive(),
  atlasMapId: z.number().int().positive(),
  id: z.number().int().positive().optional(),
  encounterKey: z.string().trim().min(1).max(96),
  regionId: z.string().trim().min(1).max(96),
  title: z.string().trim().min(3).max(160),
  eventName: z.string().trim().min(3).max(160),
  difficulty: z.number().int().min(0).max(30),
  threat: z.enum(["baixo", "médio", "alto"]),
  signal: z.string().trim().min(3).max(4000),
  response: z.string().trim().min(3).max(4000),
  consequence: z.string().trim().min(3).max(4000),
  antagonistId: z.number().int().positive().nullable().optional(),
  blessingId: z.number().int().positive().nullable().optional(),
});

export const campaignAtlasRouter = router({
  get: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), mapKey: z.string().trim().min(1).max(96) })).query(({ ctx, input }) => listCampaignAtlasForUser({ ...input, userId: ctx.user.id })),
  saveState: protectedProcedure.input(stateInput).mutation(({ ctx, input }) => saveCampaignAtlasStateForUser({ ...input, userId: ctx.user.id })),
  saveEncounter: protectedProcedure.input(encounterInput).mutation(({ ctx, input }) => saveCampaignAtlasEncounterForUser({ ...input, userId: ctx.user.id })),
  removeEncounter: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), atlasMapId: z.number().int().positive(), encounterId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCampaignAtlasEncounterForUser({ ...input, userId: ctx.user.id })),
  blessings: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignBlessingsForUser({ ...input, userId: ctx.user.id })),
});
