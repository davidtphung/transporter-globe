import { describe, expect, it } from "vitest";
import {
  expectedMissionCount,
  transporter17PayloadCount,
  transporterFixtureMissions,
  transporterFixturePayloads,
  vardaCapsuleId
} from "@/data/fixtures/transporter-fixtures";

describe("transporter fixtures", () => {
  it("includes all Transporter missions through present", () => {
    expect(transporterFixtureMissions).toHaveLength(expectedMissionCount);
    expect(transporterFixtureMissions[0].id).toBe("transporter-1");
    expect(transporterFixtureMissions.at(-1)?.id).toBe("transporter-17");
  });

  it("models Transporter-17 with 81 manifest rows", () => {
    const t17 = transporterFixturePayloads.filter((payload) => payload.missionId === "transporter-17");
    expect(t17).toHaveLength(transporter17PayloadCount);
  });

  it("includes Varda capsule reentry fixture", () => {
    const varda = transporterFixturePayloads.find((payload) => payload.id === vardaCapsuleId);
    expect(varda?.operator).toBe("Varda Space Industries");
    expect(varda?.landingSiteName).toBeTruthy();
  });
});