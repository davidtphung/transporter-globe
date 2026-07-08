import { describe, expect, it, vi, beforeEach } from "vitest";

describe("view counter API contract", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("parses CountAPI get response shape", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ value: "1284" }), { status: 200 })
    );

    const response = await fetch("https://countapi.mileshilliard.com/api/v1/get/davidtphung_transporter-globe");
    const data = (await response.json()) as { value: string };
    expect(Number(data.value)).toBe(1284);
  });
});