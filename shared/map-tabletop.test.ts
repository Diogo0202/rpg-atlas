import { describe, expect, it } from "vitest";
import { clampMapCoordinate, mapCoordinatePercent, normalizedMapCoordinate } from "./map-tabletop";

describe("coordenadas normalizadas da mesa virtual", () => {
  it("limita as coordenadas ao intervalo persistido do mapa", () => {
    expect(clampMapCoordinate(-5)).toBe(0);
    expect(clampMapCoordinate(10_004.6)).toBe(10_000);
  });

  it("transforma proporções do tabuleiro em valores estáveis", () => {
    expect(normalizedMapCoordinate(0.375)).toBe(3750);
    expect(mapCoordinatePercent(3750)).toBe("37.50");
  });
});
