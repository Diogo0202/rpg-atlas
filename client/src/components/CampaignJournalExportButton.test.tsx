// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { toastSuccess, toastError, pdfSave, pdfFactory } = vi.hoisted(() => {
  const pdfSave = vi.fn();
  const createPdf = () => ({ setFillColor: vi.fn(), rect: vi.fn(), setTextColor: vi.fn(), setFont: vi.fn(), setFontSize: vi.fn(), splitTextToSize: (text: string) => [text], addPage: vi.fn(), text: vi.fn(), setDrawColor: vi.fn(), line: vi.fn(), save: pdfSave });
  return { toastSuccess: vi.fn(), toastError: vi.fn(), pdfSave, pdfFactory: vi.fn(createPdf) };
});
vi.mock("@/lib/trpc", () => ({ trpc: { campaigns: { events: { useQuery: () => ({ isLoading: false, data: [] }) } } } }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));
vi.mock("jspdf", () => ({ jsPDF: pdfFactory }));
import { CampaignJournalExportButton } from "./CampaignJournalExportButton";

afterEach(() => { cleanup(); toastSuccess.mockClear(); toastError.mockClear(); pdfSave.mockClear(); pdfFactory.mockClear(); pdfFactory.mockImplementation(() => ({ setFillColor: vi.fn(), rect: vi.fn(), setTextColor: vi.fn(), setFont: vi.fn(), setFontSize: vi.fn(), splitTextToSize: (text: string) => [text], addPage: vi.fn(), text: vi.fn(), setDrawColor: vi.fn(), line: vi.fn(), save: pdfSave })); vi.unstubAllGlobals(); });

it("confirma a exportação JSON do diário", async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:journal"), revokeObjectURL: vi.fn() });
  const user = userEvent.setup();
  render(<CampaignJournalExportButton campaignId={8} campaignTitle="A Coroa" sessions={[]} />);
  await user.click(screen.getByRole("button", { name: "JSON" }));
  expect(toastSuccess).toHaveBeenCalledWith("Diário de campanha exportado em JSON.");
  click.mockRestore();
});

it("avisa quando a preparação do arquivo JSON falha", async () => {
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => { throw new Error("blob indisponível"); }), revokeObjectURL: vi.fn() });
  const user = userEvent.setup();
  render(<CampaignJournalExportButton campaignId={8} campaignTitle="A Coroa" sessions={[]} />);
  await user.click(screen.getByRole("button", { name: "JSON" }));
  expect(toastError).toHaveBeenCalledWith("Não foi possível exportar o diário em JSON agora.");
});

it("confirma a exportação PDF do diário", async () => {
  const user = userEvent.setup();
  render(<CampaignJournalExportButton campaignId={8} campaignTitle="A Coroa" sessions={[]} />);
  await user.click(screen.getByRole("button", { name: "PDF" }));
  expect(pdfSave).toHaveBeenCalledWith("a-coroa-diario-rpg-atlas.pdf");
  expect(toastSuccess).toHaveBeenCalledWith("Diário de campanha exportado em PDF.");
});

it("avisa quando a preparação do PDF falha", async () => {
  pdfFactory.mockImplementationOnce(() => { throw new Error("pdf indisponível"); });
  const user = userEvent.setup();
  render(<CampaignJournalExportButton campaignId={8} campaignTitle="A Coroa" sessions={[]} />);
  await user.click(screen.getByRole("button", { name: "PDF" }));
  expect(toastError).toHaveBeenCalledWith("Não foi possível exportar o diário em PDF agora.");
});
