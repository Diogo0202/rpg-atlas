// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createV5SheetData } from "@shared/vampire-v5";
import { OneRingCoreSheetPanel, V5CoreSheetPanel } from "./UniverseSheetIdentityPanel";

describe("UniverseSheetIdentityPanel", () => {
  it("edita as trilhas centrais de Vampiro V5", () => {
    const sheet = { ...createV5SheetData(), hunger: 2, humanity: 7, generation: 13, bloodPotency: 1 };
    let latest = sheet;
    render(<V5CoreSheetPanel sheet={latest} selectedClanName="Brujah" onChange={(patch) => { latest = { ...latest, ...patch }; }} />);
    expect(screen.getByRole("heading", { name: "O vampiro em foco" })).not.toBeNull();
    expect(screen.getByText("Brujah")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Fome"), { target: { value: "4" } });
    expect(latest.hunger).toBe(4);
  });

  it("edita os recursos centrais de O Um Anel", () => {
    let latest = { endurance: 24, hope: 8, shadow: 0, load: 3 };
    render(<OneRingCoreSheetPanel {...latest} onChange={(patch) => { latest = { ...latest, ...patch }; }} />);
    expect(screen.getByRole("heading", { name: "O companheiro na estrada" })).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Esperança"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("Carga"), { target: { value: "5" } });
    expect(latest).toMatchObject({ hope: 6, load: 5 });
  });
});
