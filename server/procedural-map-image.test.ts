import { afterEach, describe, expect, it, vi } from "vitest";
import { generateProceduralMapImage } from "./procedural-map-image";

const originalFetch = global.fetch;
const input = { campaignTitle: "A Coroa Partida", mapTitle: "Ponte submersa", creativeDirection: "Pedra molhada e neblina", aspectRatio: "16:9" as const };

afterEach(() => { global.fetch = originalFetch; vi.unstubAllEnvs(); });

describe("generateProceduralMapImage", () => {
  it("usa a OpenAI como rota principal e devolve sua proveniência", async () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ b64_json: Buffer.from("mapa openai").toString("base64") }] }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
    const result = await generateProceduralMapImage(input);
    expect(result).toMatchObject({ provider: "openai", fallbackUsed: false, mimeType: "image/png" });
    expect(result.bytes.toString()).toBe("mapa openai");
    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/images/generations", expect.objectContaining({ method: "POST" }));
  });

  it("usa Gemini como contingência se a OpenAI não concluir a imagem", async () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("temporariamente indisponível", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ output_image: { data: Buffer.from("mapa gemini").toString("base64"), mime_type: "image/png" } }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
    const result = await generateProceduralMapImage(input);
    expect(result).toMatchObject({ provider: "gemini", fallbackUsed: true });
    expect(result.bytes.toString()).toBe("mapa gemini");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("informa uma falha quando nenhum provedor devolve uma imagem válida", async () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    global.fetch = vi.fn().mockResolvedValue(new Response("erro", { status: 500 })) as typeof fetch;
    await expect(generateProceduralMapImage(input)).rejects.toThrow(/as APIs de imagem não concluíram/i);
  });
});
