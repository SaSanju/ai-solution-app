import { BaseProvider, CaptionRequest, CaptionResponse } from './base-provider';

export class GroqProvider extends BaseProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.model = process.env.GROQ_MODEL || 'llama3-8b-8192';
    
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const prompt = this.createPrompt(request);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      throw new Error("Failed to generate captions with Groq");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No response from Groq model");
    }

    return this.parseResponse(generatedText, request);
  }
} 