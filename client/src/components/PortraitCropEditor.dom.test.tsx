// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const mocks = vi.hoisted(() => ({ fileToDataUrl: vi.fn(), cropPortraitToDataUrl: vi.fn(), onChange: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("@/lib/portraitCrop", () => ({ defaultPortraitCrop: { zoom: 1, focusX: 50, focusY: 50, outputSize: 512 }, portraitSizes: [256, 512, 768], fileToDataUrl: mocks.fileToDataUrl, cropPortraitToDataUrl: mocks.cropPortraitToDataUrl }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
import { PortraitCropEditor } from "./PortraitCropEditor";

afterEach(() => { cleanup(); Object.values(mocks).forEach((mock) => mock.mockReset()); });

it("permite ajustar e aplicar um retrato processado antes do salvamento da ficha", async () => {
  mocks.fileToDataUrl.mockResolvedValue("data:image/jpeg;base64,fonte");
  mocks.cropPortraitToDataUrl.mockResolvedValue("data:image/jpeg;base64,ajustado");
  const user = userEvent.setup();
  render(<PortraitCropEditor name="Mara" onChange={mocks.onChange} />);
  await user.upload(screen.getByLabelText("Escolher imagem de retrato"), new File(["imagem"], "mara.jpg", { type: "image/jpeg" }));
  expect(await screen.findByLabelText("Zoom do retrato")).toBeTruthy();
  await user.selectOptions(screen.getByLabelText("Tamanho do retrato"), "768");
  await user.click(screen.getByRole("button", { name: /aplicar retrato/i }));
  expect(mocks.cropPortraitToDataUrl).toHaveBeenCalledWith("data:image/jpeg;base64,fonte", { zoom: 1, focusX: 50, focusY: 50, outputSize: 768 });
  expect(mocks.onChange).toHaveBeenCalledWith("data:image/jpeg;base64,ajustado");
});
