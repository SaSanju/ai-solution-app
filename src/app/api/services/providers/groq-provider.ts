import { BaseProvider, CaptionRequest, CaptionResponse, HashtagRequest, HashtagResponse } from './base-provider';
import { createCaptionPrompt, createHashtagPrompt } from './groq-prompts';
import { callGroq } from './groq-api'; 

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

  createCaptionPrompt = createCaptionPrompt;
  createHashtagPrompt = createHashtagPrompt;

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const prompt = this.createCaptionPrompt(request);
    return callGroq({
      apiKey: this.apiKey,
      model: this.model,
      prompt,
      request,
      type: 'caption',
    }) as Promise<CaptionResponse>;
  }

  async generateHashtags(request: HashtagRequest): Promise<HashtagResponse> {
    const prompt = this.createHashtagPrompt(request);
    return callGroq({
      apiKey: this.apiKey,
      model: this.model,
      prompt,
      request,
      type: 'hashtag',
    }) as Promise<HashtagResponse>;
  }
} 