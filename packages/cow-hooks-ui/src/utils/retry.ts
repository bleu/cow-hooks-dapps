type RetryOptions = {
  maxAttempts?: number;
  delayMs?: number;
  onRetry?: (error: Error, attempt: number) => void;
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 5,
    delayMs = 1000,
    onRetry = (error, attempt) =>
      console.warn(
        `Attempt ${attempt} failed with error: ${error.message}. Retrying...`,
      ),
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      onRetry(lastError, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(
    `Failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`,
  );
}
