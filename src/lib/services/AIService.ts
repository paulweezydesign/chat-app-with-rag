import { modelService } from './ModelService';
import { vectorStore } from './VectorStore';

export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(query: string): Promise<string> {
    try {
      if (!vectorStore.isInitialized()) {
        throw new Error('System not initialized');
      }

      const searchResults = await vectorStore.search(query);
      
      if (searchResults.length === 0) {
        return `I don't have enough context to provide a specific answer about "${query}". Could you please provide more details or rephrase your question?`;
      }
      
      const contextStr = searchResults.map((result, i) => `${i + 1}. ${result.text}`).join('\n');
      
      return `Based on the available information:

${contextStr}

Here's what I can tell you about "${query}":

This is a demonstration response. The vector search is working, but we need to connect to a real LLM API for meaningful responses.

Found ${searchResults.length} relevant document${searchResults.length === 1 ? '' : 's'}`;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }
}

export const aiService = AIService.getInstance();