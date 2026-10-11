import { NextRequest, NextResponse } from "next/server";
import { AIService, type HashtagRequest } from "../services/ai-service";

export async function POST(request: NextRequest): Promise<NextResponse<{ hashtags: string[]; success: boolean } | { error: string }>> {
  try {
    const { productName, productCategory, targetAudience }: HashtagRequest = await request.json();

    // Validate required fields
    if (!productName || !productCategory || !targetAudience) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Use the AIService with the new hashtag method
    const aiService = new AIService();
    const result = await aiService.generateHashtags({
      productName,
      productCategory,
      targetAudience
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error generating hashtags:", error);
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { error: "AI service not properly configured. Please check your environment variables." },
          { status: 500 }
        );
      }
      if (error.message.includes('Failed to generate captions') || error.message.includes('Failed to generate hashtags')) {
        return NextResponse.json(
          { error: "Failed to generate hashtags. Please try again later." },
          { status: 500 }
        );
      }
      if (error.message.includes('No AI providers available')) {
        return NextResponse.json(
          { error: "No AI providers are available. Please configure at least one provider." },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 