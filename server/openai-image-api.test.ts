import { describe, expect, it } from "vitest";

describe("credencial da API OpenAI para mapas procedurais", () => {
  it("autentica em uma consulta leve de modelos", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeTruthy();
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { data?: unknown[] };
    expect(Array.isArray(payload.data)).toBe(true);
  }, 20_000);
});
