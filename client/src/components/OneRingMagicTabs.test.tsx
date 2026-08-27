// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { OneRingMagicTabs } from "./OneRingMagicTabs";

afterEach(cleanup);

it("expõe uma aba de magias e revela o catálogo ritual ao selecioná-la", async () => {
  const user = userEvent.setup();
  render(<OneRingMagicTabs selectedIds={[]} onChange={() => undefined} />);

  expect(screen.getByText("Nenhum rito de Veyr foi vinculado a este companheiro.")).toBeTruthy();
  await user.click(screen.getByRole("tab", { name: /Magias 0/ }));

  expect(screen.getByRole("tab", { name: /Magias 0/ }).getAttribute("data-state")).toBe("active");
  expect(screen.getByText("Pactos ao alcance da mão.")).toBeTruthy();
  expect(screen.getByLabelText("Ficha de ritos selecionados")).toBeTruthy();
});
