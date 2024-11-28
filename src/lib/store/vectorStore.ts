import { create } from 'zustand';
import { Document, SearchResult } from '../types/document';
import { cosineSimilarity } from '../utils/similarity';
import { modelService } from '../services/ModelService';
import { initialData } from '../data/initialData';
import { withRetry } from '../utils/retry';

interface VectorStoreState {
  documents: Document[];
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeWithData: () => Promise<void>;
  addDocument: (text: string, metadata?: Record<string, any>) => Promise<void>;
  search: (query: string, limit?: number) => Promise<SearchResult[]>;
}

export const useVectorStore = create<VectorStoreState>((set, get) => ({
  documents: [],
  isInitialized: false,
  isInitializing: false,
  error: null,

  initializeWithData: async () => {
    const state = get();
    if (state.isInitialized || state.isInitializing) return;

    set({ isInitializing: true, error: null });

    try {
      await modelService.initialize();

      for (const item of initialData) {
        await withRetry(
          async () => {
            const embedding = await modelService.generateEmbedding(item.text);
            set(state => ({
              documents: [
                ...state.documents,
                {
                  id: crypto.randomUUID(),
                  text: item.text,
                  embedding: Array.from(embedding),
                  metadata: item.metadata,
                },
              ],
            }));
          },
          {
            maxAttempts: 3,
            baseDelay: 1000,
            onRetry: (attempt) => {
              console.log(`Retrying document initialization (${attempt}/3)...`);
            },
          }
        );
      }

      set({ isInitialized: true, isInitializing: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize vector store';
      set({ error: errorMessage, isInitializing: false });
      throw new Error(errorMessage);
    }
  },

  addDocument: async (text: string, metadata = {}) => {
    const state = get();
    if (!state.isInitialized) {
      throw new Error('Vector store not initialized');
    }

    try {
      const embedding = await modelService.generateEmbedding(text);
      set(state => ({
        documents: [
          ...state.documents,
          {
            id: crypto.randomUUID(),
            text,
            embedding: Array.from(embedding),
            metadata,
          },
        ],
      }));
    } catch (error) {
      throw new Error('Failed to add document');
    }
  },

  search: async (query: string, limit = 3) => {
    const state = get();
    if (!state.isInitialized) {
      throw new Error('Vector store not initialized');
    }

    if (state.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await modelService.generateEmbedding(query);
      
      return state.documents
        .map(doc => ({
          text: doc.text,
          metadata: doc.metadata,
          score: cosineSimilarity(queryEmbedding, doc.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      throw new Error('Failed to process search query');
    }
  },
}));