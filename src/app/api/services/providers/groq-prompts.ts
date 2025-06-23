import { CaptionRequest, HashtagRequest } from './base-provider';

export function createCaptionPrompt(request: CaptionRequest): string {
  const { productName, productDescription, tone, goal } = request;
  return [
    "Generate 3 engaging social media captions for a product with the following details:",
    "",
    `Product Name: ${productName}`,
    `Product Description: ${productDescription}`,
    `Tone: ${tone}`,
    `Goal: ${goal}`,
    "",
    "Requirements:",
    "- Create 3 different captions",
    "- Each caption should be engaging and suitable for social media",
    "- Include relevant emojis",
    `- Match the specified tone (${tone})`,
    `- Focus on the goal (${goal})`,
    "- Keep each caption between 100-200 characters",
    "- Make them creative and attention-grabbing",
    "",
    "Format the response as a JSON array with 3 caption strings."
  ].join('\n');
}

export function createHashtagPrompt(request: HashtagRequest): string {
  const { productName, productCategory, targetAudience } = request;
  return [
    "Generate 15 relevant and trending hashtags for a product with the following details:",
    "",
    `Product Name: ${productName}`,
    `Product Category: ${productCategory}`,
    `Target Audience: ${targetAudience}`,
    "",
    "Requirements:",
    "- Return only hashtags (no explanations)",
    "- Use a mix of product, category, and audience-specific hashtags",
    "- Include trending and popular tags",
    'Format the response as a JSON array of 15 hashtag strings (e.g., ["#tag1", "#tag2", ...])'
  ].join('\n');
} 