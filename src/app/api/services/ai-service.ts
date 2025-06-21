interface CaptionRequest {
  productName: string;
  productDescription: string;
  tone: string;
  goal: string;
}

interface CaptionResponse {
  captions: string[];
  success: boolean;
}

interface AIProvider {
  generateCaptions(request: CaptionRequest): Promise<CaptionResponse>;
}

class MockProvider implements AIProvider {
  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const { productName, productDescription, tone, goal } = request;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock captions based on tone and goal
    const mockCaptions = this.generateMockCaptions(request);
    
    return {
      captions: mockCaptions,
      success: true
    };
  }

  private generateMockCaptions(request: CaptionRequest): string[] {
    const { productName, productDescription, tone, goal } = request;
    
    const toneEmojis = {
      'Fun': ['🎉', '🚀', '✨', '🔥', '💫', '🎊'],
      'Luxury': ['💎', '🌟', '👑', '✨', '💫', '🛍️'],
      'Minimal': ['⚡', '💡', '🎯', '✨', '💫', '🔥'],
      'Emotional': ['💝', '💕', '💖', '✨', '💫', '🌟']
    };

    const goalEmojis = {
      'Promote': ['🚀', '💯', '🔥', '⭐', '💎', '🎯'],
      'Restock': ['🔄', '📦', '💫', '✨', '🔥', '⚡'],
      'Sale': ['💰', '🎉', '🔥', '💎', '✨', '💫'],
      'Launch': ['🚀', '🎊', '✨', '💫', '🔥', '🌟']
    };

    const toneEmoji = toneEmojis[tone as keyof typeof toneEmojis] || ['✨'];
    const goalEmoji = goalEmojis[goal as keyof typeof goalEmojis] || ['🔥'];

    const captions = [
      `${toneEmoji[0]} ${productName} is here to revolutionize your experience! ${productDescription} Perfect for ${goal.toLowerCase()} season. Don't miss out! ${goalEmoji[0]}`,
      `Discover the magic of ${productName}! ${productDescription} Limited time ${goal.toLowerCase()} - grab yours today! ${toneEmoji[1] || toneEmoji[0]}`,
      `${productName} - because you deserve the best! ${productDescription} ${goal} now and transform your world! ${goalEmoji[1] || goalEmoji[0]}`
    ];

    return captions;
  }
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const { productName, productDescription, tone, goal } = request;

    const prompt = `Generate 3 engaging social media captions for a product with the following details:

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional social media marketing expert who creates engaging captions. Always respond with valid JSON arrays containing exactly 3 caption strings."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error("Failed to generate captions with OpenAI");
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No response from OpenAI model");
    }

    return this.parseResponse(generatedText, request);
  }

  private parseResponse(generatedText: string, request: CaptionRequest): CaptionResponse {
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
      console.error("Error parsing OpenAI response:", parseError);
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

  private getFallbackCaptions(request: CaptionRequest): string[] {
    const { productName, productDescription, goal } = request;
    return [
      `🚀 ${productName} is here to revolutionize your experience! ${productDescription} Perfect for ${goal.toLowerCase()} season. Don't miss out! ✨`,
      `Discover the magic of ${productName}! ${productDescription} Limited time ${goal.toLowerCase()} - grab yours today! 🎉`,
      `${productName} - because you deserve the best! ${productDescription} ${goal} now and transform your world! 💫`
    ];
  }
}

class LlamaProvider implements AIProvider {
  private apiUrl: string;
  private apiKey?: string;

  constructor() {
    this.apiUrl = process.env.LLAMA_API_URL || '';
    this.apiKey = process.env.LLAMA_API_KEY;
    
    if (!this.apiUrl) {
      throw new Error('Llama API URL not configured');
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const { productName, productDescription, tone, goal } = request;

    const prompt = `Generate 3 engaging social media captions for a product with the following details:

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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.LLAMA_MODEL || "llama-2-7b-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional social media marketing expert who creates engaging captions. Always respond with valid JSON arrays containing exactly 3 caption strings."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Llama API Error:", errorData);
      throw new Error("Failed to generate captions with Llama");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || data.response || data.text;

    if (!generatedText) {
      throw new Error("No response from Llama model");
    }

    return this.parseResponse(generatedText, request);
  }

  private parseResponse(generatedText: string, request: CaptionRequest): CaptionResponse {
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
      console.error("Error parsing Llama response:", parseError);
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

  private getFallbackCaptions(request: CaptionRequest): string[] {
    const { productName, productDescription, goal } = request;
    return [
      `🚀 ${productName} is here to revolutionize your experience! ${productDescription} Perfect for ${goal.toLowerCase()} season. Don't miss out! ✨`,
      `Discover the magic of ${productName}! ${productDescription} Limited time ${goal.toLowerCase()} - grab yours today! 🎉`,
      `${productName} - because you deserve the best! ${productDescription} ${goal} now and transform your world! 💫`
    ];
  }
}

class AIService {
  private provider: AIProvider;

  constructor() {
    const providerType = process.env.AI_PROVIDER?.toLowerCase() || 'mock';
    
    try {
      switch (providerType) {
        case 'llama':
          this.provider = new LlamaProvider();
          console.log('Using Llama AI provider');
          break;
        case 'openai':
          this.provider = new OpenAIProvider();
          console.log('Using OpenAI provider');
          break;
        case 'mock':
        default:
          this.provider = new MockProvider();
          console.log('Using Mock provider (no AI provider configured)');
          break;
      }
    } catch (error) {
      console.error(`Failed to initialize ${providerType} provider:`, error);
      
      // Try fallback providers
      if (providerType === 'llama') {
        try {
          console.log('Falling back to OpenAI provider');
          this.provider = new OpenAIProvider();
        } catch (openaiError) {
          console.error('OpenAI fallback failed:', openaiError);
          console.log('Falling back to Mock provider');
          this.provider = new MockProvider();
        }
      } else if (providerType === 'openai') {
        try {
          console.log('Falling back to Mock provider');
          this.provider = new MockProvider();
        } catch (mockError) {
          console.error('Mock fallback failed:', mockError);
          throw error;
        }
      } else {
        // If mock fails, we have a serious issue
        throw error;
      }
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    return this.provider.generateCaptions(request);
  }
}

export type { CaptionRequest, CaptionResponse, AIProvider };
export { AIService }; 