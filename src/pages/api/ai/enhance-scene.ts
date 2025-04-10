import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ResponseData = {
  enhancedScene: string;
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
    const { sceneContent, enhancementType, characters, scriptContext } = req.body;

    if (!sceneContent || !enhancementType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create a prompt for OpenAI to enhance the scene
    let prompt = `
You are an expert screenwriter. I need you to enhance this scene:

SCENE CONTENT:
${sceneContent}

ENHANCEMENT TYPE: ${enhancementType}

CHARACTERS: ${characters?.join(', ') || 'Not specified'}

${scriptContext ? `SCRIPT CONTEXT: ${scriptContext}` : ''}
`;

    // Customize the prompt based on enhancement type
    switch (enhancementType) {
      case 'dialogue':
        prompt += `
Focus on improving the dialogue in this scene. Make it more natural, revealing of character, and impactful.
Preserve the overall flow and intent, but enhance the way characters speak to each other.`;
        break;
      case 'action':
        prompt += `
Focus on enhancing the action descriptions in this scene. Make them more vivid, tense, and engaging.
Improve the visual imagery while maintaining the scene's intent.`;
        break;
      case 'characterDevelopment':
        prompt += `
Focus on improving character development in this scene. Add moments that reveal depth, motivation, or backstory.
Make sure the characters' actions and dialogue reflect their personalities and goals.`;
        break;
      case 'plotDevelopment':
        prompt += `
Focus on strengthening the plot elements in this scene. Enhance how this scene advances the story.
Add elements that build tension, foreshadow future events, or connect to earlier scenes.`;
        break;
      default:
        prompt += `
Improve this scene while maintaining its original purpose and style. Enhance the writing quality.`;
    }

    prompt += `
Keep the scene in standard screenplay format.
Return ONLY the enhanced scene, with no explanations or comments.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a skilled screenwriter assistant that specializes in screenplay format and narrative enhancement." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const enhancedScene = completion.choices[0]?.message?.content || '';

    return res.status(200).json({ enhancedScene });
  } catch (error) {
    console.error('Error in AI scene enhancement:', error);
    return res.status(500).json({ error: 'Failed to enhance scene' });
  }
} 