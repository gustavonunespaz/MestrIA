import axios, { AxiosError } from 'axios';

export interface AIResponse {
  content: string;
  model: string;
  source: 'groq' | 'ollama';
  tokensUsed?: number;
  timestamp: Date;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  successCount: number;
}

export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private lastFailureTime?: Date;
  private successCount: number = 0;

  private failureThreshold: number = 3;
  private successThreshold: number = 2;
  private timeoutMs: number = 60000; // 1 minute

  constructor(
    failureThreshold: number = 3,
    successThreshold: number = 2,
    timeoutMs: number = 60000,
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeoutMs = timeoutMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN. Service unavailable.');
      }
    }

    try {
      const result = await fn();

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        console.log('[Circuit Breaker] State changed to CLOSED');
      }
    }
  }

  private onFailure(): void {
    this.lastFailureTime = new Date();
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      console.log('[Circuit Breaker] State changed to OPEN (too many failures)');
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.timeoutMs;
  }

  getState(): CircuitBreakerState {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount,
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
  }
}

export default CircuitBreaker;
