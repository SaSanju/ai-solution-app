import { NextResponse } from "next/server";
import { fetchAIContent } from "./service";

export async function GET() {
  try {
    const data = await fetchAIContent(); // Fetch latest AI blogs & videos
    return NextResponse.json({ message: "Crawling successful", data }, { status: 200 });
  } catch (error) {
    console.error("Crawler error:", error);
    return NextResponse.json({ error: "Failed to fetch AI content" }, { status: 500 });
  }
}
