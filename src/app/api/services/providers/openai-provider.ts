import { BaseProvider, CaptionRequest, CaptionResponse } from './base-provider';

export class OpenAIProvider extends BaseProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const prompt = this.createPrompt(request);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
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
} 