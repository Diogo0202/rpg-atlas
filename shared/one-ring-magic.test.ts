import { describe, expect, it } from "vitest";
import { addOneRingMagic, getOneRingMagicById, getOneRingMagicReference, normalizeOneRingMagicIds, oneRingMagics, removeOneRingMagic, toggleOneRingMagicFavorite } from "./one-ring-magic";

describe("magias e ritos de O Um Anel", () => {
  it("aceita apenas ritos catalogados, sem duplicar a ficha", () => {
    expect(addOneRingMagic([], "bencao-de-abrigo")).toEqual(["bencao-de-abrigo"]);
    expect(addOneRingMagic(["bencao-de-abrigo"], "bencao-de-abrigo")).toEqual(["bencao-de-abrigo"]);
    expect(normalizeOneRingMagicIds(["bencao-de-abrigo", "inventado", 4])).toEqual(["bencao-de-abrigo"]);
  });
  it("remove um rito da ficha sem alterar os demais", () => expect(removeOneRingMagic(["bencao-de-abrigo", "selo-de-bronze"], "bencao-de-abrigo")).toEqual(["selo-de-bronze"]));
  it("resolve apenas ritos existentes para usos de exibição e impressão", () => {
    expect(getOneRingMagicById("selo-de-bronze")?.name).toBe("Selo de Bronze");
    expect(getOneRingMagicById("rito-inexistente")).toBeUndefined();
  });
  it("distingue os ritos originais de Veyr inspirados em Elden Ring das fontes do Drive", () => {
    const original = getOneRingMagicById("brasa-do-ultimo-rei");
    expect(oneRingMagics.filter((magic) => magic.origin === "veyra-original")).toHaveLength(5);
    expect(original?.sourcePage).toBeUndefined();
    expect(original && getOneRingMagicReference(original)).toContain("Rito original de Veyr");
  });
  it("alterna favoritos somente entre ritos catalogados", () => {
    expect(toggleOneRingMagicFavorite([], "bencao-de-abrigo")).toEqual(["bencao-de-abrigo"]);
    expect(toggleOneRingMagicFavorite(["bencao-de-abrigo"], "bencao-de-abrigo")).toEqual([]);
    expect(toggleOneRingMagicFavorite([], "rito-inexistente")).toEqual([]);
  });
});
