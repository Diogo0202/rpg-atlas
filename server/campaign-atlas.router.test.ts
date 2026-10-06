import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "atlas-test-user",
      email: "atlas@example.com",
      name: "Atlas Test",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("campaignAtlas router", () => {
  it("registra o contrato protegido e rejeita uma campanha inválida antes de consultar o banco", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.campaignAtlas.get({ campaignId: 0, mapKey: "shadowlords-beacon-hill" })).rejects.toThrow();
  });
});
