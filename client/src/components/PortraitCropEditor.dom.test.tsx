// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { PortraitCropEditor } from "./PortraitCropEditor";

afterEach(() => cleanup());

function mockImageAndCanvas() {
  class MockImage {
    naturalWidth = 1000;
    naturalHeight = 800;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  }
  vi.stubGlobal("Image", MockImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ imageSmoothingEnabled: false, imageSmoothingQuality: "low", drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,ajustado");
}

it("permite ajustar e aplicar um retrato processado antes do salvamento da ficha", async () => {
  mockImageAndCanvas();
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<PortraitCropEditor name="Mara" onChange={onChange} />);
  await user.upload(screen.getByLabelText("Escolher imagem de retrato"), new File(["imagem"], "mara.jpg", { type: "image/jpeg" }));
  expect(await screen.findByLabelText("Zoom do retrato")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Zoom do retrato"), { target: { value: "2" } });
  await user.click(screen.getByRole("button", { name: /aplicar recorte/i }));
  expect(onChange).toHaveBeenCalledWith("data:image/jpeg;base64,ajustado");
});
