import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany(); // Fetch blogs from DB
    const videos = await prisma.video.findMany(); // Fetch videos from DB

    return NextResponse.json({ blogs, videos }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs and videos:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}