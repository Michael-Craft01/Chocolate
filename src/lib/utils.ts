import { logger } from './logger.js';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number; factor: number; taskName: string } = {
    retries: 3,
    delay: 1000,
    factor: 2,
    taskName: 'Task'
  }
): Promise<T> {
  let lastError: any;
  let currentDelay = options.delay;

  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (attempt === options.retries) break;

      logger.warn(`[RETRY] ${options.taskName} failed (Attempt ${attempt}/${options.retries}). Retrying in ${currentDelay}ms... | Error: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= options.factor;
    }
  }

  logger.error(`[FATAL] ${options.taskName} failed after ${options.retries} attempts.`);
  throw lastError;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
