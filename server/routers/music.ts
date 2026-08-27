import { z } from "zod";
import { createCampaignMusicBriefForUser, createCampaignMusicCueForUser, listCampaignMusicCuesForUser, removeCampaignMusicCueForUser, updateCampaignMusicCueForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const sceneTypes = ["arrival", "exploration", "intrigue", "tension", "combat", "aftermath", "rest"] as const;
const cueInput = z.object({
  campaignId: z.number().int().positive(),
  sessionId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(3).max(160),
  sceneType: z.enum(sceneTypes),
  durationSeconds: z.number().int().min(30).max(180),
  musicPrompt: z.string().trim().min(40).max(8000),
  notes: z.string().trim().max(4000).optional(),
  audioUrl: z.string().url().max(4000).refine((value) => value.startsWith("https://") || value.startsWith("http://"), "Informe uma URL de áudio http(s).").optional(),
});

export const musicRouter = router({
  list: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignMusicCuesForUser({ campaignId: input.campaignId, userId: ctx.user.id })),
  createBrief: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), sessionId: z.number().int().positive().nullable().optional(), sceneType: z.enum(sceneTypes), durationSeconds: z.number().int().min(30).max(180), sceneDescription: z.string().trim().min(12).max(1200) })).mutation(({ ctx, input }) => createCampaignMusicBriefForUser({ ...input, userId: ctx.user.id })),
  create: protectedProcedure.input(cueInput).mutation(({ ctx, input }) => createCampaignMusicCueForUser({ ...input, userId: ctx.user.id })),
  update: protectedProcedure.input(cueInput.extend({ cueId: z.number().int().positive() })).mutation(({ ctx, input }) => updateCampaignMusicCueForUser({ ...input, userId: ctx.user.id })),
  remove: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), cueId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCampaignMusicCueForUser({ ...input, userId: ctx.user.id })),
});
