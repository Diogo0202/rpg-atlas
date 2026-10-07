import { describe, expect, it } from "vitest";
import { APP_TITLE } from "./appConfig";

describe("configuração pública do aplicativo", () => {
  it("mantém o título do RPG Atlas disponível no ambiente do cliente", () => {
    expect(APP_TITLE).toBe("RPG Atlas");
  });
});
