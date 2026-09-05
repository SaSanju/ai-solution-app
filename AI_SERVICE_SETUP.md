# AI Service Setup Guide

This guide explains how to configure the modular AI service to switch between OpenAI and Groq providers.

## Architecture

The AI service is now built with a modular architecture:

```
src/app/api/services/
├── ai-service.ts              # Main service orchestrator
├── providers/
│   ├── base-provider.ts       # Base provider interface and common logic
│   ├── groq-provider.ts       # Groq API implementation
│   ├── openai-provider.ts     # OpenAI API implementation
│   └── index.ts              # Provider exports
```

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Required Variables

```bash
# AI Provider Configuration
# Set to 'openai' or 'groq' to choose the AI provider
# If not set, defaults to 'groq'
AI_PROVIDER=groq
```

### Groq Configuration (Default)

```bash
# Required for Groq provider (default)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b  # Optional, defaults to openai/gpt-oss-20b
```

### OpenAI Configuration

```bash
# Required for OpenAI provider
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```

## Configuration Examples

### Using Groq (Default)
```bash
AI_PROVIDER=groq
GROQ_API_KEY=gsk-your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
```

### Using OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
```

## How It Works

1. **Provider Selection**: The service automatically selects the provider based on `AI_PROVIDER` environment variable
2. **Default to Groq**: If no provider is specified, it defaults to Groq provider
3. **Fallback Chain**: Groq → OpenAI (if Groq fails)
4. **Modular Design**: Each provider is isolated in its own file
5. **Common Interface**: All providers implement the same interface
6. **Shared Logic**: Common functionality is in the base provider

## Code Structure

### Base Provider (`base-provider.ts`)
- Defines common interfaces (`CaptionRequest`, `CaptionResponse`, `AIProvider`)
- Provides shared functionality (response parsing, fallback captions, prompt creation)
- Abstract class that all providers extend

### Provider Implementations
- **GroqProvider**: Handles Groq API calls with Llama 3 models
- **OpenAIProvider**: Handles OpenAI API calls with GPT models
- Each provider handles its own authentication and API-specific logic

### Main Service (`ai-service.ts`)
- Orchestrates provider selection and fallback logic
- Provides a clean interface for the API routes
- Handles provider initialization errors

## API Usage

The caption generation API endpoint remains the same:

```javascript
POST /api/generate-caption
{
  "productName": "Your Product",
  "productDescription": "Product description",
  "tone": "Fun",
  "goal": "Promote"
}
```

## Features

- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Provider Switching**: Easy switching between OpenAI and Groq
- ✅ **Automatic Fallback**: Groq → OpenAI fallback chain
- ✅ **Groq Default**: Fast inference with Llama 3 models
- ✅ **Consistent Interface**: Same API regardless of provider
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Extensible**: Easy to add new providers

## Adding New Providers

To add a new provider:

1. Create a new file in `providers/` (e.g., `new-provider.ts`)
2. Extend `BaseProvider` class
3. Implement the `generateCaptions` method
4. Add the provider to the `AIService` constructor
5. Export from `providers/index.ts`

Example:
```typescript
import { BaseProvider, CaptionRequest, CaptionResponse } from './base-provider';

export class NewProvider extends BaseProvider {
  async generateCaptions(request: CaptionRequest): Promise<CaptionResponse> {
    // Implementation here
  }
}
```

## Troubleshooting

### Common Issues

1. **"AI service not properly configured"**
   - Check that your environment variables are set correctly
   - Ensure the API keys are valid
   - Verify the provider name is correct

2. **"Failed to generate captions"**
   - Check your internet connection
   - Verify API endpoint URLs are correct
   - Check API rate limits

3. **"No AI providers available"**
   - Ensure at least one provider is properly configured
   - Check that API keys are valid
   - Verify environment variables are loaded

4. **Provider not switching**
   - Ensure `AI_PROVIDER` is set to 'openai' or 'groq'
   - Check console logs for provider initialization messages
   - If no provider is set, it defaults to 'groq' 