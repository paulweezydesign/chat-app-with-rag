import { pipeline } from '@xenova/transformers';

class AIService {
  private static instance: AIService;
  private model: any;
  private modelInitPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async initModel(): Promise<void> {
    if (!this.modelInitPromise) {
      this.modelInitPromise = (async () => {
        try {
          this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true,
            progress_callback: (progress) => {
              if (progress.status === 'progress') {
                console.log(`Loading AI service: ${Math.round(progress.progress * 100)}%`);
              }
            }
          });
        } catch (error) {
          this.modelInitPromise = null;
          throw error;
        }
      })();
    }
    return this.modelInitPromise;
  }

  async generateResponse(query: string, context: string[]): Promise<string> {
    try {
      await this.initModel();
      
      if (context.length === 0) {
        return `I don't have enough context to provide a specific answer about "${query}". Could you please provide more details or rephrase your question?`;
      }
      
      // Format context and query
      const contextStr = context.map((c, i) => `${i + 1}. ${c}`).join('\n');
      
      return `Based on the available information:

${contextStr}

Here's what I can tell you about "${query}":

This is a demonstration response. The vector search is working, but we need to connect to a real LLM API for meaningful responses.

Found ${context.length} relevant document${context.length === 1 ? '' : 's'}`;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }
}

export const aiService = AIService.getInstance();