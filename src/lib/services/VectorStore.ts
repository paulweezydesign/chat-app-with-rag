import { Document, SearchResult } from '../types/document';
import { useVectorStore } from '../store/vectorStore';

export class VectorStore {
  private static instance: VectorStore;

  private constructor() {}

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  async initializeWithData(): Promise<void> {
    return useVectorStore.getState().initializeWithData();
  }

  async addDocument(text: string, metadata: Record<string, any> = {}): Promise<void> {
    return useVectorStore.getState().addDocument(text, metadata);
  }

  async search(query: string, limit = 3): Promise<SearchResult[]> {
    return useVectorStore.getState().search(query, limit);
  }

  getInitializationProgress(): number {
    return useVectorStore.getState().isInitializing ? modelService.getInitializationProgress() : 1;
  }

  isInitialized(): boolean {
    return useVectorStore.getState().isInitialized;
  }
}

export const vectorStore = VectorStore.getInstance();