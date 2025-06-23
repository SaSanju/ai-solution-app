export interface CaptionRequest {
  productName: string;
  productDescription: string;
  tone: string;
  goal: string;
}

export interface HashtagRequest {
  productName: string;
  productCategory: string;
  targetAudience: string;
}

export interface CaptionResponse {
  captions: string[];
  success: boolean;
}

export interface HashtagResponse {
  hashtags: string[];
  success: boolean;
}

export interface AIProvider {
  generateCaptions(request: CaptionRequest): Promise<CaptionResponse>;
  generateHashtags(request: HashtagRequest): Promise<HashtagResponse>;
  createCaptionPrompt(request: CaptionRequest): string;
  createHashtagPrompt(request: HashtagRequest): string;
}

export abstract class BaseProvider implements AIProvider {
  abstract generateCaptions(request: CaptionRequest): Promise<CaptionResponse>;
  abstract createCaptionPrompt(request: CaptionRequest): string;
  abstract createHashtagPrompt(request: HashtagRequest): string;
  abstract generateHashtags(request: HashtagRequest): Promise<HashtagResponse>;

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
} 