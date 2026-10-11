import { BaseProvider, CaptionRequest, CaptionResponse, HashtagRequest, HashtagResponse } from './base-provider';
import { createCaptionPrompt, createHashtagPrompt } from './openai-prompts';
import { callOpenAI } from './openai-api';

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

  createCaptionPrompt = createCaptionPrompt;
  createHashtagPrompt = createHashtagPrompt;

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    const prompt = this.createCaptionPrompt(request);
    return callOpenAI({
      apiKey: this.apiKey,
      model: this.model,
      prompt,
      request,
      type: 'caption',
    }) as Promise<CaptionResponse>;
  }

  async generateHashtags(request: HashtagRequest): Promise<HashtagResponse> {
    const prompt = this.createHashtagPrompt(request);
    return callOpenAI({
      apiKey: this.apiKey,
      model: this.model,
      prompt,
      request,
      type: 'hashtag',
    }) as Promise<HashtagResponse>;
  }
} 