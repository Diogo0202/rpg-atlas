import { buildV5SheetExportSections, type V5SheetData } from "@shared/vampire-v5";
import { drawPdfTheme } from "./pdfThemes";

export type V5PdfPayload = {
  name: string;
  concept?: string;
  campaignName?: string;
  sheet: V5SheetData;
};

export function getV5PdfFilename(name: string) {
  const safeName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "").toLowerCase() || "personagem";
  return `rpg-atlas-v5-${safeName}.pdf`;
}

export function createV5MailtoUrl(payload: Pick<V5PdfPayload, "name" | "concept" | "campaignName">) {
  const subject = `Ficha V5 · ${payload.name}`;
  const body = [
    `Segue a ficha de ${payload.name} exportada pelo RPG Atlas.`,
    payload.concept ? `Conceito: ${payload.concept}.` : "",
    payload.campaignName ? `Crônica: ${payload.campaignName}.` : "",
    "O PDF foi baixado neste dispositivo para ser anexado a esta mensagem.",
  ].filter(Boolean).join("\n\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function createV5PdfFile(payload: V5PdfPayload): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({ title: `Ficha V5 · ${payload.name}`, subject: "Ficha preenchida para impressão" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const drawTheme = () => drawPdfTheme(pdf, "vampire-v5", pageWidth, pageHeight);
  drawTheme();
  const sections = buildV5SheetExportSections(payload);
  let y = 18;
  let page = 1;
  const footer = (pageNumber: number) => {
    pdf.setDrawColor(181, 91, 50);
    pdf.line(15, pageHeight - 13, pageWidth - 15, pageHeight - 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(92, 89, 82);
    pdf.text(`RPG Atlas · Arquivo Obsidiano · Ficha V5 · página ${pageNumber}`, 15, pageHeight - 8);
  };
  const nextPage = () => {
    footer(page);
    pdf.addPage();
    page += 1;
    drawTheme();
    return 18;
  };

  pdf.setFillColor(17, 19, 18);
  pdf.rect(0, 0, pageWidth, 42, "F");
  pdf.setTextColor(234, 227, 213);
  pdf.setFont("times", "bold");
  pdf.setFontSize(22);
  pdf.text("RPG ATLAS · V5", 15, 19);
  pdf.setFontSize(12);
  pdf.setFont("times", "normal");
  pdf.text(payload.name, 15, 29);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(131, 168, 154);
  pdf.text("FICHA PREENCHIDA · PRONTA PARA IMPRESSÃO A4", 15, 36);
  y = 53;

  sections.forEach((section) => {
    const lines = section.lines.flatMap((line) => pdf.splitTextToSize(line, pageWidth - 34) as string[]);
    const height = 10 + lines.length * 4.4;
    if (y + height > pageHeight - 20) y = nextPage();
    pdf.setDrawColor(181, 91, 50);
    pdf.setLineWidth(0.5);
    pdf.line(15, y, pageWidth - 15, y);
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(181, 91, 50);
    pdf.text(section.title.toUpperCase(), 15, y);
    y += 5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(34, 37, 34);
    lines.forEach((line) => {
      if (y > pageHeight - 20) y = nextPage();
      pdf.text(line, 17, y);
      y += 4.4;
    });
    y += 4;
  });

  footer(page);
  return new File([pdf.output("blob")], getV5PdfFilename(payload.name), { type: "application/pdf" });
}

export function downloadV5Pdf(file: File) {
  downloadBlob(file, file.name);
}

export async function shareV5Pdf(payload: V5PdfPayload): Promise<"native" | "unsupported" | "cancelled"> {
  const file = await createV5PdfFile(payload);
  const shareData = { title: `Ficha V5 · ${payload.name}`, text: `Dossiê de personagem de ${payload.name} exportado pelo RPG Atlas.`, files: [file] };
  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      return "native";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      throw error;
    }
  }

  return "unsupported";
}
