import axios from 'axios';

export type SceneBridgeRequest = {
  previousScene: string;
  nextScene: string;
  characters: string[];
  scriptContext?: string;
};

export type SceneEnhancementRequest = {
  sceneContent: string;
  enhancementType: 'dialogue' | 'action' | 'characterDevelopment' | 'plotDevelopment';
  characters: string[];
  scriptContext?: string;
};

export const generateSceneBridge = async (request: SceneBridgeRequest): Promise<string> => {
  try {
    const response = await axios.post('/api/ai/bridge-scenes', request);
    return response.data.generatedScene;
  } catch (error) {
    console.error('Error generating scene bridge:', error);
    throw new Error('Failed to generate scene bridge');
  }
};

export const enhanceScene = async (request: SceneEnhancementRequest): Promise<string> => {
  try {
    const response = await axios.post('/api/ai/enhance-scene', request);
    return response.data.enhancedScene;
  } catch (error) {
    console.error('Error enhancing scene:', error);
    throw new Error('Failed to enhance scene');
  }
};

export const getSceneSuggestions = async (
  sceneContent: string, 
  characters: string[]
): Promise<string[]> => {
  try {
    const response = await axios.post('/api/ai/scene-suggestions', { 
      sceneContent,
      characters
    });
    return response.data.suggestions;
  } catch (error) {
    console.error('Error getting scene suggestions:', error);
    throw new Error('Failed to get scene suggestions');
  }
};

export const getChatResponse = async (message: string, conversationHistory: any[]): Promise<string> => {
  try {
    const response = await axios.post('/api/ai/chat', {
      message,
      conversationHistory
    });
    return response.data.response;
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get chat response');
  }
}; 