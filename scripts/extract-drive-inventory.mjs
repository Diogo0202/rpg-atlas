import { readFileSync, writeFileSync } from "node:fs";

const source = "/home/ubuntu/Downloads/rpg_drive_folder.html";
const target = "/home/ubuntu/rpg-atlas/docs/drive-inventory.md";
const html = readFileSync(source, "utf8");
const matches = [...html.matchAll(/data-id="([A-Za-z0-9_-]+)"[^>]*data-tooltip="([^"]+)"/g)];
const items = new Map();

for (const match of matches) {
  const [, id, tooltip] = match;
  const [name, ...typeParts] = tooltip.split(" ");
  if (name && id) items.set(id, { id, name, type: typeParts.join(" ") || "Drive item" });
}

const rows = [...items.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
const content = [
  "# Inventário público — pasta compartilhada do Drive",
  "",
  "Este inventário foi extraído passivamente da listagem pública da pasta em 25 de agosto de 2026. O conteúdo dos arquivos ainda precisa ser revisado antes de ser convertido em material de jogo.",
  "",
  "| Material | Tipo indicado | Identificador do Drive |",
  "|---|---|---|",
  ...rows.map((item) => `| ${item.name.replaceAll("|", "\\|")} | ${item.type.replaceAll("|", "\\|")} | ${item.id} |`),
  "",
].join("\n");

writeFileSync(target, content);
console.log(`Inventário criado com ${rows.length} itens em ${target}`);
