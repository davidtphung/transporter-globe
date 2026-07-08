import { NextRequest, NextResponse } from "next/server";
import { missions, payloads } from "@/data/transporter";
import { searchCatalog } from "@/lib/search";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const operator = request.nextUrl.searchParams.get("operator") ?? "all";
  const status = request.nextUrl.searchParams.get("status") ?? "all";
  const orbitType = request.nextUrl.searchParams.get("orbitType") ?? "all";

  const results = searchCatalog(missions, payloads, query, { operator, status, orbitType });

  return NextResponse.json({
    query,
    count: results.length,
    results
  });
}