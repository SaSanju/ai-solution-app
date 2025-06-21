import { NextRequest, NextResponse } from "next/server";
import { AIService, type CaptionRequest } from "../services/ai-service";

export async function POST(request: NextRequest): Promise<NextResponse<{ captions: string[]; success: boolean } | { error: string }>> {
  try {
    const { productName, productDescription, tone, goal }: CaptionRequest = await request.json();

    // Validate required fields
    if (!productName || !productDescription || !tone || !goal) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = new AIService();
    
    // Generate captions using the selected provider
    const result = await aiService.generateCaptions({
      productName,
      productDescription,
      tone,
      goal
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error generating captions:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { error: "AI service not properly configured. Please check your environment variables." },
          { status: 500 }
        );
      }
      if (error.message.includes('Failed to generate captions')) {
        return NextResponse.json(
          { error: "Failed to generate captions. Please try again later." },
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