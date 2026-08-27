import { drawPdfTheme } from "./pdfThemes";
import { getOneRingMagicById, type OneRingMagic } from "@shared/one-ring-magic";

type OneRingPrintSheet = {
  culture: string;
  calling: string;
  shadowPath: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  endurance: number;
  hope: number;
  shadow: number;
  notes: string;
  magicIds?: string[];
};

export type OneRingPdfPayload = { name: string; concept?: string; campaignName?: string; sheet: OneRingPrintSheet };

function safePdfName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "").toLowerCase() || "companheiro";
}

export function getOneRingPdfFilename(name: string) {
  return `rpg-atlas-um-anel-${safePdfName(name)}.pdf`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function createOneRingPdfFile(payload: OneRingPdfPayload): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const drawTheme = () => drawPdfTheme(pdf, "o-um-anel", width, height);
  drawTheme();
  pdf.setProperties({ title: `Ficha de O Um Anel · ${payload.name}`, subject: "Ficha preenchida para impressão" });
  let y = 18;
  let page = 1;
  const footer = () => { pdf.setDrawColor(181, 91, 50); pdf.line(15, height - 13, width - 15, height - 13); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(92, 89, 82); pdf.text(`RPG Atlas · O Um Anel · impressão A4 · página ${page}`, 15, height - 8); };
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

  pdf.setFillColor(17, 19, 18); pdf.rect(0, 0, width, 42, "F"); pdf.setTextColor(234, 227, 213); pdf.setFont("times", "bold"); pdf.setFontSize(22); pdf.text("RPG ATLAS · O UM ANEL", 15, 19); pdf.setFont("times", "normal"); pdf.setFontSize(12); pdf.text(payload.name, 15, 29); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(131, 168, 154); pdf.text("FICHA PREENCHIDA · PRONTA PARA IMPRESSÃO A4", 15, 36); y = 53;
  const { sheet } = payload;
  section("Identidade", [`Nome: ${payload.name || "Sem nome"}`, `Conceito: ${payload.concept || "Não informado"}`, `Campanha: ${payload.campaignName || "Sem vínculo"}`, `Cultura: ${sheet.culture || "Não informada"}`, `Chamado: ${sheet.calling || "Não informado"}`, `Caminho da Sombra: ${sheet.shadowPath || "Não informado"}`]);
  section("Recursos", [`Vigor: ${sheet.endurance}`, `Esperança: ${sheet.hope}`, `Sombra: ${sheet.shadow}`]);
  section("Atributos", Object.entries(sheet.attributes).map(([name, value]) => `${name}: ${value}`));
  section("Perícias", Object.entries(sheet.skills).filter(([, value]) => value > 0).map(([name, value]) => `${name}: ${value}`).concat(Object.values(sheet.skills).some((value) => value > 0) ? [] : ["Nenhuma perícia registrada"]));
  const selectedMagics = (sheet.magicIds ?? []).map(getOneRingMagicById).filter((magic): magic is OneRingMagic => Boolean(magic));
  section("Magias e ritos de Veyr", selectedMagics.length ? selectedMagics.map((magic) => `${magic.name} · ${magic.discipline} · p. ${magic.sourcePage}`) : ["Nenhum rito de Veyr selecionado."]);
  section("Registro da companhia", [sheet.notes || "Nenhuma nota registrada."]);
  footer();
  return new File([pdf.output("blob")], getOneRingPdfFilename(payload.name), { type: "application/pdf" });
}

export function downloadOneRingPdf(file: File) {
  downloadBlob(file, file.name);
}
