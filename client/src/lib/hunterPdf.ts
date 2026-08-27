import { drawPdfTheme } from "./pdfThemes";
import type { HunterSheetData } from "@shared/hunter";

export type HunterPdfPayload = { name: string; concept?: string; campaignName?: string; sheet: HunterSheetData };

function safePdfName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "").toLowerCase() || "cacador";
}

export function getHunterPdfFilename(name: string) {
  return `rpg-atlas-cacador-${safePdfName(name)}.pdf`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function createHunterPdfFile(payload: HunterPdfPayload): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const drawTheme = () => drawPdfTheme(pdf, "hunter", width, height);
  drawTheme();
  pdf.setProperties({ title: `Ficha de Caçador · ${payload.name}`, subject: "Ficha preenchida para impressão" });
  let y = 18;
  let page = 1;
  const footer = () => { pdf.setDrawColor(61, 88, 75); pdf.line(15, height - 13, width - 15, height - 13); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(76, 91, 82); pdf.text(`RPG Atlas · Caçador · impressão A4 · página ${page}`, 15, height - 8); };
  const nextPage = () => { footer(); pdf.addPage(); page += 1; drawTheme(); y = 18; };
  const section = (title: string, lines: string[]) => {
    const wrapped = lines.flatMap((line) => pdf.splitTextToSize(line, width - 34) as string[]);
    if (y + 12 + wrapped.length * 4.4 > height - 20) nextPage();
    pdf.setDrawColor(181, 91, 50); pdf.line(15, y, width - 15, y); y += 6;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(181, 91, 50); pdf.text(title.toUpperCase(), 15, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(34, 37, 34);
    wrapped.forEach((line) => { if (y > height - 20) nextPage(); pdf.text(line, 17, y); y += 4.4; });
    y += 4;
  };

  pdf.setFillColor(35, 54, 44); pdf.rect(0, 0, width, 42, "F"); pdf.setTextColor(240, 244, 236); pdf.setFont("times", "bold"); pdf.setFontSize(22); pdf.text("RPG ATLAS · CAÇADOR", 15, 19); pdf.setFont("times", "normal"); pdf.setFontSize(12); pdf.text(payload.name, 15, 29); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(224, 151, 113); pdf.text("FICHA PREENCHIDA · PRONTA PARA IMPRESSÃO A4", 15, 36); y = 53;
  const { sheet } = payload;
  section("Identidade", [`Nome: ${payload.name || "Sem nome"}`, `Conceito: ${payload.concept || "Não informado"}`, `Campanha: ${payload.campaignName || "Sem vínculo"}`, `Credo: ${sheet.creed || "Não informado"}`, `Impulso: ${sheet.drive || "Não informado"}`, `Célula: ${sheet.cell || "Não informada"}`]);
  section("Recursos da Caçada", [`Vitalidade: ${sheet.health}`, `Força de Vontade: ${sheet.willpower}`, `Desespero: ${sheet.desperation}`, `Ambição: ${sheet.ambition || "Não informada"}`]);
  section("Atributos", Object.entries(sheet.attributes).map(([name, value]) => `${name}: ${value}`));
  section("Perícias", Object.entries(sheet.skills).filter(([, value]) => value > 0).map(([name, value]) => `${name}: ${value}`).concat(Object.values(sheet.skills).some((value) => value > 0) ? [] : ["Nenhuma perícia registrada"]));
  section("Dossiê", [`Vantagens e recursos: ${sheet.edges || "Não registrados"}`, `Notas: ${sheet.notes || "Nenhuma nota registrada."}`]);
  footer();
  return new File([pdf.output("blob")], getHunterPdfFilename(payload.name), { type: "application/pdf" });
}

export function downloadHunterPdf(file: File) {
  downloadBlob(file, file.name);
}
