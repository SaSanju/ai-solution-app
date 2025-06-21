import { AIProvider, CaptionRequest, CaptionResponse, GroqProvider, OpenAIProvider } from './providers';

export class AIService {
  private provider: AIProvider;

  constructor() {
    const providerType = process.env.AI_PROVIDER?.toLowerCase() || 'groq';
    
    try {
      switch (providerType) {
        case 'openai':
          this.provider = new OpenAIProvider();
          console.log('Using OpenAI provider');
          break;
        case 'groq':
        default:
          this.provider = new GroqProvider();
          console.log('Using Groq provider (default)');
          break;
      }
    } catch (error) {
      console.error(`Failed to initialize ${providerType} provider:`, error);
      
      // Try fallback providers
      if (providerType === 'groq') {
        try {
          console.log('Falling back to OpenAI provider');
          this.provider = new OpenAIProvider();
        } catch (openaiError) {
          console.error('OpenAI fallback failed:', openaiError);
          throw new Error('No AI providers available. Please check your configuration.');
        }
      } else if (providerType === 'openai') {
        try {
          console.log('Falling back to Groq provider');
          this.provider = new GroqProvider();
        } catch (groqError) {
          console.error('Groq fallback failed:', groqError);
          throw new Error('No AI providers available. Please check your configuration.');
        }
      } else {
        throw error;
      }
    }
  }

  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    return this.provider.generateCaptions(request);
  }
}

export type { CaptionRequest, CaptionResponse, AIProvider }; 