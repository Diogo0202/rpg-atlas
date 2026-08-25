import { readFileSync } from "node:fs";

const source = process.argv[2];
if (!source) throw new Error("Informe o arquivo HTML exportado da pasta do Drive.");
const html = readFileSync(source, "utf8");
const matches = [...html.matchAll(/data-id="([A-Za-z0-9_-]+)"[^>]*data-tooltip="([^"]+)"/g)];
const items = new Map();
for (const match of matches) {
  const [, id, tooltip] = match;
  items.set(id, { id, tooltip });
}
console.log(JSON.stringify([...items.values()], null, 2));
