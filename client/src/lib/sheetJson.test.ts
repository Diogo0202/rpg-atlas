import { describe, expect, it } from "vitest";
import { createCharacterJsonEnvelope, createCharacterShareUrl, createVaultBackup, parseCharacterJson, parseCharacterSharePayload, parseVaultBackup, slugifyFilename } from "./sheetJson";

describe("sheetJson", () => {
  it("cria e interpreta um envelope de ficha versionado", () => {
    const payload = createCharacterJsonEnvelope({ systemId: "vampiro-v5", name: "Lívia Vesper", concept: "Investigadora", campaignId: "42", createdAt: "2026-08-20T10:00:00.000Z", sheet: { hunger: 2 } });
    expect(payload).toMatchObject({ format: "rpg-atlas-character-v1", version: 1, systemId: "vampiro-v5", character: { name: "Lívia Vesper", concept: "Investigadora", campaignId: "42", createdAt: "2026-08-20T10:00:00.000Z", sheet: { hunger: 2 } } });
    expect(parseCharacterJson(payload)).toEqual({ systemId: "vampiro-v5", name: "Lívia Vesper", concept: "Investigadora", campaignId: "42", createdAt: "2026-08-20T10:00:00.000Z", sheet: { hunger: 2 } });
  });

  it("aceita o formato legado de exportação do Caçador", () => {
    expect(parseCharacterJson({ format: "rpg-atlas-hunter-character-v1", character: { name: "Mara", concept: "Vigilante", sheetData: { creed: "marcial", attributes: {}, skills: {} } } })).toEqual({ systemId: "cacador-a-vinganca", name: "Mara", concept: "Vigilante", sheet: { creed: "marcial", attributes: {}, skills: {} } });
  });

  it("preserva todos os registros de um backup e rejeita entradas inválidas", () => {
    const backup = createVaultBackup([{ systemId: "vampiro-v5", name: "Lívia", concept: "Noite", createdAt: "2026-08-20T10:00:00.000Z", sheet: { hunger: 1 }, updatedAt: "2026-08-27T10:00:00.000Z" }, { systemId: "o-um-anel", name: "Eldar", concept: "Jornada", sheet: { hope: 8 } }]);
    expect(parseVaultBackup(backup)).toHaveLength(2);
    expect(parseVaultBackup({ ...backup, records: [{ systemId: "vampiro-v5", name: "x", sheet: {} }] })).toBeNull();
    expect(slugifyFilename("Lívia Vesper / noite")).toBe("livia-vesper-noite");
  });
});

  it("gera e decodifica um link JSON compartilhável", () => {
    const payload = createCharacterJsonEnvelope({ systemId: "cacador-a-vinganca", name: "João da Luz", concept: "Investigação", level: 4, tags: ["mesa", "caçada"], sheet: { desperation: 2 } });
    const url = createCharacterShareUrl(payload, "https://rpgatlas.example");
    expect(url.startsWith("https://rpgatlas.example/compartilhar/json?payload=")).toBe(true);
    const encoded = new URL(url).searchParams.get("payload");
    expect(encoded).toBeTruthy();
    expect(parseCharacterSharePayload(encoded || "")).toEqual({ systemId: "cacador-a-vinganca", name: "João da Luz", concept: "Investigação", level: 4, tags: ["mesa", "caçada"], sheet: { desperation: 2 } });
    expect(parseCharacterSharePayload("payload-corrompido")).toBeNull();
  });
