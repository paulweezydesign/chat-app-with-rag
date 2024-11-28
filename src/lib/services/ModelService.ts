import { useModelStore } from '../store/modelStore';
import { withRetry } from '../utils/retry';
import { MODEL_CONFIG } from '../config/model';

export class ModelService {
  private static instance: ModelService;

  private constructor() {}

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  getInitializationProgress(): number {
    return useModelStore.getState().progress;
  }

  async initialize(): Promise<void> {
    return useModelStore.getState().initialize();
  }

  async generateEmbedding(text: string): Promise<Float32Array> {
    const { model, isInitialized } = useModelStore.getState();

    if (!isInitialized || !model) {
      throw new Error('Model not initialized');
    }

    return withRetry(
      async () => {
        const output = await model(text, { pooling: 'mean', normalize: true });
        return output.data;
      },
      {
        maxAttempts: MODEL_CONFIG.retry.maxAttempts,
        baseDelay: MODEL_CONFIG.retry.baseDelay,
        maxDelay: MODEL_CONFIG.retry.maxDelay,
        onRetry: (attempt) => {
          console.log(`Retrying embedding generation (${attempt}/${MODEL_CONFIG.retry.maxAttempts})...`);
        },
      }
    );
  }
}

export const modelService = ModelService.getInstance();