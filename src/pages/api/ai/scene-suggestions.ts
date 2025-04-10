import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResponseData = {
  suggestions: string[];
}

type ErrorData = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sceneContent, characters } = req.body;

    if (!sceneContent) {
      return res.status(400).json({ error: 'Missing scene content' });
    }

    // Create a prompt for OpenAI to generate suggestions
    const prompt = `
You are an expert screenwriter. Based on the following scene, generate 3-5 specific suggestions to improve it:

SCENE CONTENT:
${sceneContent}

CHARACTERS: ${characters?.join(', ') || 'Not specified'}

For each suggestion:
1. Focus on a specific element (dialogue, action, character motivation, setting description, etc.)
2. Explain why this change would improve the scene
3. Provide a brief example of how it might be implemented

Format each suggestion as a clear, concise paragraph that a writer could directly apply.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a skilled screenwriting consultant who provides precise, actionable feedback." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    
    // Parse the suggestions from the response
    // Split by numbered items or paragraph breaks
    const suggestions = responseContent
      .split(/\d+\.\s|\n\n/)
      .filter(suggestion => suggestion.trim().length > 0)
      .map(suggestion => suggestion.trim());

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error generating scene suggestions:', error);
    return res.status(500).json({ error: 'Failed to generate scene suggestions' });
  }
} 