import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "./App";

describe("rotas da interface principal", () => {
  it("mantém pontos de entrada estáveis para cena e cofre local", () => {
    expect(APP_ROUTES.sceneMode).toBe("/modo-cena");
    expect(APP_ROUTES.localVault).toBe("/cofre-local");
  });
});
