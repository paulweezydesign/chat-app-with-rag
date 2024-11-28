export async function withRetry<T>(
  operation: () => Promise<T>,
  {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry = (attempt: number) => {},
  }: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        onRetry(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}