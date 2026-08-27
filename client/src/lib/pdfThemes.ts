export type PdfSystemTheme = "vampire-v5" | "hunter" | "o-um-anel";

type PdfDocument = {
  setFillColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setLineWidth: (value: number) => void;
  rect: (x: number, y: number, width: number, height: number, style?: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  circle: (x: number, y: number, radius: number, style?: string) => void;
};

export const PDF_THEME_LABELS: Record<PdfSystemTheme, string> = {
  "vampire-v5": "Vampiro V5",
  hunter: "Caçador",
  "o-um-anel": "O Um Anel",
};

export function drawPdfTheme(pdf: PdfDocument, theme: PdfSystemTheme, width: number, height: number) {
  pdf.setFillColor(249, 246, 238);
  pdf.rect(0, 0, width, height, "F");
  pdf.setLineWidth(0.45);
  pdf.setDrawColor(210, 202, 187);
  pdf.rect(8, 8, width - 16, height - 16);

  if (theme === "vampire-v5") {
    pdf.setFillColor(38, 24, 25);
    pdf.rect(0, 0, width, 35, "F");
    pdf.setDrawColor(158, 63, 53);
    pdf.line(12, 40, width - 12, 40);
    pdf.setFillColor(124, 48, 42);
    pdf.circle(width - 19, 18, 8, "F");
    pdf.setDrawColor(231, 192, 159);
    pdf.circle(width - 19, 18, 5.5);
    return;
  }

  if (theme === "hunter") {
    pdf.setFillColor(232, 238, 232);
    pdf.rect(0, 0, width, height, "F");
    pdf.setDrawColor(61, 88, 75);
    pdf.rect(11, 11, width - 22, height - 22);
    pdf.setLineWidth(0.3);
    for (let offset = 0; offset < width; offset += 14) pdf.line(offset, 0, offset - height, height);
    pdf.setFillColor(181, 91, 50);
    pdf.rect(0, 0, width, 7, "F");
    pdf.setDrawColor(181, 91, 50);
    pdf.line(15, 43, width - 15, 43);
    return;
  }

  pdf.setFillColor(247, 241, 220);
  pdf.rect(0, 0, width, height, "F");
  pdf.setDrawColor(116, 93, 56);
  pdf.rect(10, 10, width - 20, height - 20);
  pdf.setLineWidth(0.6);
  pdf.circle(width - 23, 18, 7.5);
  pdf.setLineWidth(0.25);
  pdf.circle(width - 23, 18, 4.6);
  pdf.setDrawColor(72, 99, 78);
  pdf.line(14, 39, width - 14, 39);
}
