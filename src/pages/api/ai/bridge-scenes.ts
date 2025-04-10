import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResponseData = {
  generatedScene: string;
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
    const { previousScene, nextScene, characters, scriptContext } = req.body;

    if (!previousScene || !nextScene) {
      return res.status(400).json({ error: 'Missing required scenes' });
    }

    // Create a prompt for OpenAI to generate a bridging scene
    const prompt = `
You are an expert screenwriter. I need you to write a scene that bridges these two scenes in a screenplay:

PREVIOUS SCENE:
${previousScene}

NEXT SCENE:
${nextScene}

CHARACTERS: ${characters.join(', ')}

${scriptContext ? `SCRIPT CONTEXT: ${scriptContext}` : ''}

Write a scene that creates a natural transition between these two scenes. Follow standard screenplay format.
Focus on creating a logical and emotionally satisfying connection between these scenes.
The scene should be concise yet effective in bridging the narrative gap.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a skilled screenwriter assistant that specializes in screenplay format and narrative flow." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedScene = completion.choices[0]?.message?.content || '';

    return res.status(200).json({ generatedScene });
  } catch (error) {
    console.error('Error in AI scene bridging:', error);
    return res.status(500).json({ error: 'Failed to generate scene bridge' });
  }
} 