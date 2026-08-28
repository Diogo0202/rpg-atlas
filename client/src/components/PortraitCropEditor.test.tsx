// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PortraitCropEditor } from "./PortraitCropEditor";

function mockImage() {
  class MockImage {
    naturalWidth = 1000;
    naturalHeight = 800;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  }
  vi.stubGlobal("Image", MockImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ imageSmoothingEnabled: false, imageSmoothingQuality: "low", drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,cropped");
}

describe("PortraitCropEditor", () => {
  it("seleciona uma imagem, permite ajustar zoom e confirma um retrato recortado", async () => {
    mockImage();
    const onChange = vi.fn();
    render(<PortraitCropEditor onChange={onChange} />);
    const input = screen.getByLabelText(/escolher retrato/i) as HTMLInputElement;
    const file = new File(["image"], "portrait.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByAltText("Pré-visualização do recorte")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Zoom do retrato"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar recorte" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("data:image/jpeg;base64,cropped"));
  });

  it("remove um retrato já confirmado", () => {
    const onChange = vi.fn();
    render(<PortraitCropEditor value="data:image/jpeg;base64,current" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
