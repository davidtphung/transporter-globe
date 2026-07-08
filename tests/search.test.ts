import { describe, expect, it } from "vitest";
import { missions, payloads } from "@/data/transporter";
import { searchCatalog } from "@/lib/search";

describe("searchCatalog", () => {
  it("finds payloads by operator", () => {
    const results = searchCatalog(missions, payloads, "Varda");
    expect(results.some((result) => result.type === "payload" && result.label.includes("W-Series"))).toBe(true);
  });

  it("finds missions by name", () => {
    const results = searchCatalog(missions, payloads, "Transporter-17");
    expect(results.some((result) => result.type === "mission" && result.missionId === "transporter-17")).toBe(true);
  });

  it("filters by status", () => {
    const results = searchCatalog(missions, payloads, "", { status: "reentered" });
    expect(results.every((result) => result.type !== "payload" || result.subtitle.includes("reentered"))).toBe(true);
  });
});