import { type V5InventoryEntry } from "@shared/vampire-v5";
import { drawPdfTheme } from "./pdfThemes";

export function getAnimalPdfFilename(name: string) {
  const safeName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "").toLowerCase() || "companheiro";
  return `rpg-atlas-companheiro-${safeName}.pdf`;
}

export async function createAnimalPdfFile(animal: V5InventoryEntry): Promise<File> {
  if (!animal.animalProfile) throw new Error("Este item não possui uma ficha de animal para exportar.");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const profile = animal.animalProfile;
  drawPdfTheme(pdf, "vampire-v5", width, height);
  pdf.setFillColor(38, 24, 25); pdf.rect(0, 0, width, 38, "F");
  pdf.setTextColor(234, 227, 213); pdf.setFont("times", "bold"); pdf.setFontSize(22); pdf.text("RPG ATLAS · COMPANHEIRO", 15, 18);
  pdf.setFont("times", "normal"); pdf.setFontSize(14); pdf.text(animal.name, 15, 29);
  pdf.setTextColor(34, 37, 34); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(`ESPÉCIE · ${profile.species.toUpperCase()}`, 15, 54);
  pdf.setDrawColor(181, 91, 50); pdf.line(15, 58, width - 15, 58);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.text(`Força ${profile.strength}   ·   Destreza ${profile.dexterity}   ·   Vigor ${profile.stamina}   ·   Vitalidade ${profile.health}`, 15, 69);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(181, 91, 50); pdf.text("DESLOCAMENTO E ATAQUE", 15, 85);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(34, 37, 34); pdf.text(pdf.splitTextToSize(`${profile.speed} · ${profile.attack}`, width - 30), 15, 93);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(181, 91, 50); pdf.text("CAPACIDADES", 15, 115);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(34, 37, 34); pdf.text(pdf.splitTextToSize(profile.traits.join(" · "), width - 30), 15, 123);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(181, 91, 50); pdf.text("REGISTRO DE AQUISIÇÃO", 15, 148);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(34, 37, 34); pdf.text(pdf.splitTextToSize(`${animal.specification}\nRecursos: ${animal.resources}${animal.priceLabel ? ` · Referência: ${animal.priceLabel}` : ""}`, width - 30), 15, 156);
  pdf.setDrawColor(181, 91, 50); pdf.line(15, height - 16, width - 15, height - 16); pdf.setFontSize(7); pdf.setTextColor(92, 89, 82); pdf.text("RPG Atlas · Arquivo Obsidiano · ficha resumida de companheiro", 15, height - 10);
  return new File([pdf.output("blob")], getAnimalPdfFilename(animal.name), { type: "application/pdf" });
}

export function downloadAnimalPdf(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = file.name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
