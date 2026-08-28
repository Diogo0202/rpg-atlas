import { expect, it } from "vitest";
import { readFileSync } from "node:fs";

it("declara identidades próprias de sangue e jornada para as fichas principais", () => {
  const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");
  expect(stylesheet).toContain(".system-vampire");
  expect(stylesheet).toContain(".system-one-ring");
  expect(stylesheet).toContain("--system-accent");
});
