import { describe, expect, it } from "vitest";

describe("configuração pública do aplicativo", () => {
  it("mantém o título do RPG Atlas disponível no ambiente do cliente", () => {
    expect(import.meta.env.VITE_APP_TITLE).toBe("RPG Atlas");
  });
});
