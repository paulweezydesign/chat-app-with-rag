export const MODEL_CONFIG = {
  name: 'Xenova/all-MiniLM-L6-v2',
  type: 'feature-extraction',
  options: {
    quantized: true,
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
} as const;