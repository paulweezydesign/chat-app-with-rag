import { pipeline, Pipeline } from '@xenova/transformers';

interface Document {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
}

class VectorStore {
  private static instance: VectorStore;
  private documents: Document[] = [];
  private model: Pipeline | null = null;
  private modelInitPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  private async initModel(): Promise<void> {
    if (!this.modelInitPromise) {
      this.modelInitPromise = (async () => {
        try {
          this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized: true,
            progress_callback: (progress) => {
              if (progress.status === 'progress') {
                console.log(`Loading model: ${Math.round(progress.progress * 100)}%`);
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

  private async ensureModel(): Promise<Pipeline> {
    await this.initModel();
    if (!this.model) {
      throw new Error('Model initialization failed');
    }
    return this.model;
  }

  private async generateEmbedding(text: string): Promise<Float32Array> {
    try {
      const model = await this.ensureModel();
      const output = await model(text, { pooling: 'mean', normalize: true });
      return output.data;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to process text. Please try again.');
    }
  }

  private cosineSimilarity(a: Float32Array, b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async addDocument(text: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(text);
      this.documents.push({
        id: crypto.randomUUID(),
        text,
        embedding: Array.from(embedding),
        metadata
      });
    } catch (error) {
      console.error('Error adding document:', error);
      throw new Error('Failed to process document. Please try again.');
    }
  }

  async search(query: string, limit = 3): Promise<Array<{ text: string; metadata: Record<string, any>; score: number }>> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      return this.documents
        .map(doc => ({
          text: doc.text,
          metadata: doc.metadata,
          score: this.cosineSimilarity(queryEmbedding, doc.embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching:', error);
      throw new Error('Failed to process search query. Please try again.');
    }
  }

  async initializeWithData(): Promise<void> {
    const initialData = [
      {
        text: "React's useState hook is used for managing state in functional components. It returns an array with the current state value and a function to update it.",
        metadata: { topic: 'react', subtopic: 'hooks' }
      },
      {
        text: "useEffect runs after every render. You can optimize it by providing a dependency array as the second argument.",
        metadata: { topic: 'react', subtopic: 'hooks' }
      },
      {
        text: "TypeScript interfaces define contracts in your code. They can be extended and implemented by classes.",
        metadata: { topic: 'typescript', subtopic: 'basics' }
      }
    ];

    try {
      // Initialize model first
      await this.initModel();
      
      // Add documents sequentially
      for (const item of initialData) {
        await this.addDocument(item.text, item.metadata);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      throw new Error('Failed to initialize knowledge base. Please refresh the page.');
    }
  }
}

export const vectorStore = VectorStore.getInstance();