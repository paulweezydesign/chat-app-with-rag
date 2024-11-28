import { create } from 'zustand';
import { MODEL_CONFIG } from '../config/model';
import { withRetry } from '../utils/retry';
import { pipeline, Pipeline } from '@xenova/transformers';

interface ModelState {
  model: Pipeline | null;
  progress: number;
  error: string | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  model: null,
  progress: 0,
  error: null,
  isInitialized: false,

  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),

  initialize: async () => {
    if (get().model) return;

    try {
      const model = await withRetry(
        async () => {
          return await pipeline(
            MODEL_CONFIG.type,
            MODEL_CONFIG.name,
            {
              ...MODEL_CONFIG.options,
              progress_callback: (progress: any) => {
                if (progress.status === 'progress') {
                  get().setProgress(progress.progress);
                }
              },
            }
          );
        },
        {
          maxAttempts: MODEL_CONFIG.retry.maxAttempts,
          baseDelay: MODEL_CONFIG.retry.baseDelay,
          maxDelay: MODEL_CONFIG.retry.maxDelay,
          onRetry: (attempt) => {
            console.log(`Retrying model initialization (${attempt}/${MODEL_CONFIG.retry.maxAttempts})...`);
          },
        }
      );

      set({ model, isInitialized: true, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to initialize model';
      set({ error: errorMessage, isInitialized: false });
      throw new Error(errorMessage);
    }
  },
}));