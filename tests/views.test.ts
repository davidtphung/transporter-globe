import { describe, expect, it, vi, beforeEach } from "vitest";

describe("view counter API contract", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("parses CountAPI get response shape", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ value: 1284 }), { status: 200 })
    );

    const response = await fetch("https://api.countapi.xyz/get/davidtphung/transporter-globe");
    const data = (await response.json()) as { value: number };
    expect(data.value).toBe(1284);
  });
});