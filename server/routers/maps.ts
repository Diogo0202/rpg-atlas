import { z } from "zod";
import { createCampaignMapForUser, createCampaignMapMarkerForUser, generateCampaignMapImageForUser, listCampaignMapsForUser, moveCampaignMapMarkerForUser, removeCampaignMapMarkerForUser, updateCampaignMapForUser, updateCampaignMapMarkerForUser, uploadCampaignMapImageForUser } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const markerType = z.enum(["location", "character", "threat", "objective", "secret"]);
const mapContext = z.object({ campaignId: z.number().int().positive(), mapId: z.number().int().positive() });

function decodeImage(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Envie uma imagem PNG, JPEG ou WebP válida.");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 4 * 1024 * 1024) throw new Error("A imagem do mapa deve ter no máximo 4 MB.");
  return { mimeType: match[1] as "image/png" | "image/jpeg" | "image/webp", bytes };
}

export const mapsRouter = router({
  list: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => listCampaignMapsForUser({ userId: ctx.user.id, ...input })),
  create: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), title: z.string().trim().min(3).max(160) })).mutation(({ ctx, input }) => createCampaignMapForUser({ userId: ctx.user.id, ...input })),
  update: protectedProcedure.input(mapContext.extend({ title: z.string().trim().min(3).max(160), gridEnabled: z.boolean(), gridSize: z.number().int().min(20).max(240) })).mutation(({ ctx, input }) => updateCampaignMapForUser({ userId: ctx.user.id, ...input })),
  uploadImage: protectedProcedure.input(mapContext.extend({ imageData: z.string().min(32).max(5_600_000) })).mutation(({ ctx, input }) => {
    const image = decodeImage(input.imageData);
    return uploadCampaignMapImageForUser({ userId: ctx.user.id, campaignId: input.campaignId, mapId: input.mapId, ...image });
  }),
  generateImage: protectedProcedure.input(mapContext.extend({ creativeDirection: z.string().trim().min(12).max(1200), aspectRatio: z.enum(["16:9", "4:3", "1:1"]) })).mutation(({ ctx, input }) => generateCampaignMapImageForUser({ userId: ctx.user.id, ...input })),
  createMarker: protectedProcedure.input(mapContext.extend({ label: z.string().trim().min(1).max(120), description: z.string().trim().max(2000).optional(), markerType, color: z.string().regex(/^#[0-9a-fA-F]{6}$/), positionX: z.number().int().min(0).max(10_000), positionY: z.number().int().min(0).max(10_000) })).mutation(({ ctx, input }) => createCampaignMapMarkerForUser({ userId: ctx.user.id, ...input })),
  updateMarker: protectedProcedure.input(mapContext.extend({ markerId: z.number().int().positive(), label: z.string().trim().min(1).max(120), description: z.string().trim().max(2000).optional(), markerType, color: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).mutation(({ ctx, input }) => updateCampaignMapMarkerForUser({ userId: ctx.user.id, ...input })),
  moveMarker: protectedProcedure.input(mapContext.extend({ markerId: z.number().int().positive(), positionX: z.number().int().min(0).max(10_000), positionY: z.number().int().min(0).max(10_000) })).mutation(({ ctx, input }) => moveCampaignMapMarkerForUser({ userId: ctx.user.id, ...input })),
  removeMarker: protectedProcedure.input(mapContext.extend({ markerId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCampaignMapMarkerForUser({ userId: ctx.user.id, ...input })),
});
