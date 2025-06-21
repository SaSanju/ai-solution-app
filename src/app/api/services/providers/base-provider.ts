export interface CaptionRequest {
  productName: string;
  productDescription: string;
  tone: string;
  goal: string;
}

export interface CaptionResponse {
  captions: string[];
  success: boolean;
}

export interface AIProvider {
  generateCaptions(request: CaptionRequest): Promise<CaptionResponse>;
}

export abstract class BaseProvider implements AIProvider {
  abstract generateCaptions(request: CaptionRequest): Promise<CaptionResponse>;

  protected parseResponse(generatedText: string, request: CaptionRequest): CaptionResponse {
    let captions: string[];
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        captions = JSON.parse(jsonMatch[0]);
      } else {
        captions = generatedText
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('```'))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 3);
      }
    } catch (parseError) {
      console.error(`Error parsing AI response:`, parseError);
      captions = this.getFallbackCaptions(request);
    }

    while (captions.length < 3) {
      captions.push(this.getFallbackCaptions(request)[0]);
    }

    return {
      captions: captions.slice(0, 3),
      success: true
    };
  }

  protected getFallbackCaptions(request: CaptionRequest): string[] {
    const { productName, productDescription, goal } = request;
    return [
      `🚀 ${productName} is here to revolutionize your experience! ${productDescription} Perfect for ${goal.toLowerCase()} season. Don't miss out! ✨`,
      `Discover the magic of ${productName}! ${productDescription} Limited time ${goal.toLowerCase()} - grab yours today! 🎉`,
      `${productName} - because you deserve the best! ${productDescription} ${goal} now and transform your world! 💫`
    ];
  }

  protected createPrompt(request: CaptionRequest): string {
    const { productName, productDescription, tone, goal } = request;
    
    return `Generate 3 engaging social media captions for a product with the following details:

Product Name: ${productName}
Product Description: ${productDescription}
Tone: ${tone}
Goal: ${goal}

Requirements:
- Create 3 different captions
- Each caption should be engaging and suitable for social media
- Include relevant emojis
- Match the specified tone (${tone})
- Focus on the goal (${goal})
- Keep each caption between 100-200 characters
- Make them creative and attention-grabbing

Format the response as a JSON array with 3 caption strings.`;
  }
} 