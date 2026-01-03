export type LoadingListener = (isLoading: boolean) => void;

class LoadingService {
  private activeRequests = 0;
  private listeners = new Set<LoadingListener>();

  startRequest() {
    this.activeRequests += 1;
    this.notify();
  }

  endRequest() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.notify();
  }

  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    // Immediately inform the new listener of current state
    listener(this.activeRequests > 0);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const isLoading = this.activeRequests > 0;
    this.listeners.forEach((listener) => listener(isLoading));
  }
}

export const loadingService = new LoadingService();
