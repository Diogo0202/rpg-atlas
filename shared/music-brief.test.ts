import { describe, expect, it } from "vitest";
import { musicBriefSchema, parseMusicBriefResponse } from "./music-brief";

const validBrief = {
  title: "Passagem sob o sino",
  bpm: 72,
  durationSeconds: 120,
  atmosphere: "Melancolia mineral e expectativa crescente junto ao rio.",
  instrumentation: ["violoncelo grave", "percussão de madeira", "sintetizador granular"],
  soundscape: "Água distante, sinos submersos e reverberação ampla de pedra.",
  arrangement: [{ fromSeconds: 0, toSeconds: 45, intensity: 2, description: "Cordas graves e água distante estabelecem o presságio." }, { fromSeconds: 45, toSeconds: 120, intensity: 6, description: "A percussão se aproxima e os sinos tensionam a travessia." }],
  prompt: "Instrumental somente, sem vocais. Crie uma faixa de 120 segundos a 72 BPM, em tom menor, com violoncelo grave, percussão de madeira e sintetizador granular. Atmosfera mineral e tensa, água distante e sinos submersos, produção cinematográfica discreta. [0:00 - 0:45] Presságio contido. [0:45 - 2:00] Travessia crescente.",
};

describe("musicBriefSchema", () => {
  it("aceita um brief estruturado com duração, instrumentação e progressão", () => {
    expect(musicBriefSchema.parse(validBrief)).toMatchObject({ bpm: 72, durationSeconds: 120, title: "Passagem sob o sino" });
  });

  it("rejeita saídas livres que não preservam a diretiva instrumental", () => {
    expect(musicBriefSchema.safeParse({ ...validBrief, prompt: "Uma música triste." }).success).toBe(false);
  });

  it("valida a resposta serializada da IA e rejeita duração divergente", () => {
    expect(parseMusicBriefResponse(JSON.stringify(validBrief), 120)).toMatchObject({ title: "Passagem sob o sino", bpm: 72 });
    expect(() => parseMusicBriefResponse(JSON.stringify({ ...validBrief, durationSeconds: 90 }), 120)).toThrow(/incompleto/i);
    expect(() => parseMusicBriefResponse("resposta livre", 120)).toThrow(/formato inválido/i);
  });
});
