// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const addMemberMutate = vi.fn();
const updateMemberMutate = vi.fn();
const removeMemberMutate = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaigns: { members: { invalidate: vi.fn() }, mine: { invalidate: vi.fn() } } }),
    campaigns: {
      members: { useQuery: () => ({ isLoading: false, data: [{ userId: 1, name: "Narrador", email: "narrador@veyr.test", role: "narrator", ownerId: 1 }] }) },
      addMember: { useMutation: () => ({ mutate: addMemberMutate, isPending: false }) },
      updateMemberRole: { useMutation: () => ({ mutate: updateMemberMutate, isPending: false }) },
      removeMember: { useMutation: () => ({ mutate: removeMemberMutate, isPending: false }) },
    },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CampaignMembersPanel } from "./CampaignMembersPanel";

afterEach(() => cleanup());

it("permite que o narrador inclua participante por e-mail", async () => {
  const user = userEvent.setup();
  render(<CampaignMembersPanel campaigns={[{ id: 7, title: "A Coroa Partida", memberRole: "narrator" }]} initialCampaignId={7} />);
  await user.type(screen.getByLabelText("E-mail do participante"), "jogador@veyr.test");
  await user.selectOptions(screen.getByLabelText("Papel do participante"), "observer");
  await user.click(screen.getByRole("button", { name: /incluir/i }));
  expect(addMemberMutate).toHaveBeenCalledWith({ campaignId: 7, email: "jogador@veyr.test", role: "observer" });
});

it("informa que jogadores não administram os participantes", () => {
  render(<CampaignMembersPanel campaigns={[{ id: 8, title: "O Sino Afogado", memberRole: "player" }]} initialCampaignId={8} />);
  expect(screen.getByText(/a lista de participantes e as permissões são administradas pelo narrador/i)).toBeTruthy();
  expect(screen.queryByLabelText("E-mail do participante")).toBeNull();
});
