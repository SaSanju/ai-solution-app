import { CaptionRequest, CaptionResponse, HashtagRequest, HashtagResponse } from './base-provider';

interface CallGroqParams {
  apiKey: string;
  model: string;
  prompt: string;
  request: CaptionRequest | HashtagRequest;
  type: 'caption' | 'hashtag';
}

export async function callGroq({ apiKey, model, prompt, type }: CallGroqParams): Promise<CaptionResponse | HashtagResponse> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional social media marketing expert who creates engaging captions or hashtags. Always respond with valid JSON arrays."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: type === 'caption' ? 2048 : 2048,
      temperature: 0.8,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Groq API Error:", errorData);
    throw new Error(`Failed to generate ${type}s with Groq`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content;

  if (type === 'caption') {
    // Parse as CaptionResponse
    let captions: string[];
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        captions = JSON.parse(jsonMatch[0]);
      } else {
        captions = generatedText
          .split('\n')
          .filter((line: string) => line.trim() && !line.startsWith('```'))
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 3);
      }
    } catch (parseError) {
      console.error(`Error parsing AI response:`, parseError);
      captions = [];
    }
    while (captions.length < 3) {
      captions.push('');
    }
    return { captions: captions.slice(0, 3), success: true };
  } else {
    // Parse as HashtagResponse
    let hashtags: string[] = [];
    try {
      if (generatedText) {
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          hashtags = JSON.parse(jsonMatch[0]);
        } else {
          hashtags = generatedText.match(/#\w+/g) || [];
        }
      }
    } catch (parseError) {
      console.error(`Error parsing AI response:`, parseError);
      hashtags = generatedText ? (generatedText.match(/#\w+/g) || []) : [];
    }
    return { hashtags, success: true };
  }
} 