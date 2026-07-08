import { NextResponse } from "next/server";
import { getViewCount, incrementViewCount } from "@/lib/views";

export async function GET() {
  try {
    const views = await getViewCount();
    return NextResponse.json({ views, generatedAtUtc: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { views: 0, error: error instanceof Error ? error.message : "Unable to read view count" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const views = await incrementViewCount();
    return NextResponse.json({ views, generatedAtUtc: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { views: 0, error: error instanceof Error ? error.message : "Unable to increment view count" },
      { status: 500 }
    );
  }
}