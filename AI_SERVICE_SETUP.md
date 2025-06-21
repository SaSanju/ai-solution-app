# AI Service Setup Guide

This guide explains how to configure the AI service to switch between OpenAI, Llama, and Mock providers.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Required Variables

```bash
# AI Provider Configuration
# Set to 'openai', 'llama', or 'mock' to choose the AI provider
# If not set, defaults to 'mock'
AI_PROVIDER=mock
```

### OpenAI Configuration

```bash
# Required for OpenAI provider
OPENAI_API_KEY=your_openai_api_key_here
```

### Llama Configuration

```bash
# Required for Llama provider
LLAMA_API_URL=https://your-llama-api-endpoint.com/v1/chat/completions
LLAMA_API_KEY=your_llama_api_key_here  # Optional
LLAMA_MODEL=llama-2-7b-chat  # Optional, defaults to llama-2-7b-chat
```

## Configuration Examples

### Using Mock Provider (Default - No API Keys Required)
```bash
AI_PROVIDER=mock
# No additional configuration needed
```

### Using OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
```

### Using Llama
```bash
AI_PROVIDER=llama
LLAMA_API_URL=https://api.llama.com/v1/chat/completions
LLAMA_API_KEY=your-llama-key
LLAMA_MODEL=llama-2-13b-chat
```

## How It Works

1. **Provider Selection**: The service automatically selects the provider based on `AI_PROVIDER` environment variable
2. **Default to Mock**: If no provider is specified, it defaults to the mock provider
3. **Fallback Chain**: Llama → OpenAI → Mock (if Llama fails)
4. **Error Handling**: Comprehensive error handling for all providers
5. **Response Parsing**: All providers use the same response parsing logic for consistency

## Mock Provider Features

The Mock Provider is perfect for:
- **Development**: No API keys required
- **Testing**: Consistent, predictable responses
- **Demo**: Shows how the service works
- **Fallback**: When other providers fail

### Mock Provider Behavior:
- ✅ **Realistic Delay**: 1-second delay to simulate API calls
- ✅ **Tone-Aware**: Different emojis based on selected tone
- ✅ **Goal-Aware**: Different emojis based on selected goal
- ✅ **Consistent Format**: Same response structure as real providers
- ✅ **No Dependencies**: Works without any external APIs

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

- ✅ **Provider Switching**: Easy switching between OpenAI, Llama, and Mock
- ✅ **Automatic Fallback**: Llama → OpenAI → Mock fallback chain
- ✅ **Mock Provider**: No API keys required for development
- ✅ **Consistent Interface**: Same API regardless of provider
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Response Parsing**: Robust parsing for different response formats

## Troubleshooting

### Common Issues

1. **"AI service not properly configured"**
   - Check that your environment variables are set correctly
   - Ensure the API keys are valid
   - Try using `AI_PROVIDER=mock` for testing

2. **"Failed to generate captions"**
   - Check your internet connection
   - Verify API endpoint URLs are correct
   - Check API rate limits
   - The service will automatically fall back to mock provider

3. **Provider not switching**
   - Ensure `AI_PROVIDER` is set to 'openai', 'llama', or 'mock'
   - Check console logs for provider initialization messages
   - If no provider is set, it defaults to 'mock'

4. **Using Mock Provider**
   - No configuration needed
   - Perfect for development and testing
   - Provides realistic responses with appropriate delays
   - Tone and goal-aware emoji selection 