// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OneRingMagicPanel } from "./OneRingMagicPanel";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverMock, writable: true });

function Harness() { const [selected, setSelected] = useState<string[]>([]); return <OneRingMagicPanel selectedIds={selected} onChange={setSelected} />; }

afterEach(cleanup);

it("seleciona e remove um rito sem depender exclusivamente do arrastar", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getAllByRole("button", { name: "Selecionar" })[0]);
  expect(screen.getAllByText("Bênção de Abrigo")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Remover Bênção de Abrigo" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Remover Bênção de Abrigo" }));
  expect(screen.queryByRole("button", { name: "Remover Bênção de Abrigo" })).toBeNull();
});

it("aceita um rito arrastado para a ficha", () => {
  render(<Harness />);
  const dropZone = screen.getByLabelText("Ficha de ritos selecionados");
  fireEvent.drop(dropZone, { dataTransfer: { getData: () => "selo-de-bronze" } });
  expect(screen.getByRole("button", { name: "Remover Selo de Bronze" })).toBeTruthy();
});

it("oferece um gatilho acessível para consultar os detalhes de cada rito", () => {
  render(<Harness />);
  const details = screen.getByRole("button", { name: "Ver descrição de Brasa do Último Rei" });
  expect(details.getAttribute("aria-label")).toBe("Ver descrição de Brasa do Último Rei");
  expect(screen.getByRole("button", { name: "Ver descrição de Bênção de Abrigo" })).toBeTruthy();
});
