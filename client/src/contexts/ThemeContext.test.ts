import { describe, expect, it } from "vitest";
import { resolveArchiveTheme, shouldAnimateThemeChange, toggleArchiveTheme } from "./ThemeContext";

describe("preferência de tema do Arquivo Obsidiano", () => {
  it("preserva apenas valores claros ou escuros armazenados", () => {
    expect(resolveArchiveTheme("light", "dark")).toBe("light");
    expect(resolveArchiveTheme("invalido", "dark")).toBe("dark");
  });

  it("alterna de forma determinística entre luz e véu noturno", () => {
    expect(toggleArchiveTheme("dark")).toBe("light");
    expect(toggleArchiveTheme("light")).toBe("dark");
  });

  it("preserva a preferência de reduzir movimento durante a troca", () => {
    expect(shouldAnimateThemeChange(false)).toBe(true);
    expect(shouldAnimateThemeChange(true)).toBe(false);
  });
});
