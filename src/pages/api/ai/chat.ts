import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResponseData = {
  response: string;
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
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Format the conversation history for OpenAI
    const formattedMessages = [
      {
        role: 'system',
        content: `You are Bridge, an AI writing assistant specialized in screenwriting. 
You help writers improve their scripts with practical, specific suggestions.
Keep your responses concise, informative, and focused on screenwriting craft.
When asked about screenwriting concepts, provide clear explanations with examples.
When asked to help with a scene or story element, offer specific, actionable advice.`,
      },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error in chat service:', error);
    return res.status(500).json({ error: 'Failed to get chat response' });
  }
} 