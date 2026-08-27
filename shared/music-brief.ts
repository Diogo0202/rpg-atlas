import { z } from "zod";

export const musicBriefSchema = z.object({
  title: z.string().trim().min(3).max(160),
  bpm: z.number().int().min(40).max(180),
  durationSeconds: z.number().int().min(30).max(180),
  atmosphere: z.string().trim().min(12).max(500),
  instrumentation: z.array(z.string().trim().min(2).max(80)).min(2).max(6),
  soundscape: z.string().trim().min(8).max(500),
  arrangement: z.array(z.object({
    fromSeconds: z.number().int().min(0).max(180),
    toSeconds: z.number().int().min(1).max(180),
    intensity: z.number().int().min(1).max(10),
    description: z.string().trim().min(8).max(500),
  }).refine((block) => block.toSeconds > block.fromSeconds, "Cada bloco deve avançar no tempo.")).min(2).max(4),
  prompt: z.string().trim().min(80).max(8000).refine((value) => value.startsWith("Instrumental somente, sem vocais. Crie uma faixa de"), "O prompt deve preservar a diretiva instrumental."),
}).strict();

export type MusicBrief = z.infer<typeof musicBriefSchema>;

export function parseMusicBriefResponse(rawBrief: string, requestedDurationSeconds: number): MusicBrief {
  let parsedBrief: unknown;
  try { parsedBrief = JSON.parse(rawBrief); } catch { throw new Error("A IA retornou um brief em formato inválido. Tente novamente."); }
  const validation = musicBriefSchema.safeParse(parsedBrief);
  if (!validation.success || validation.data.durationSeconds !== requestedDurationSeconds) throw new Error("A IA retornou um brief musical incompleto. Tente novamente.");
  return validation.data;
}
