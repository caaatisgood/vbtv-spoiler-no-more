import { log } from './logger'

interface ElementObserverOptions {
  selector: string;
}

export class ElementObserver {
  private observer: MutationObserver | null = null;
  private element: HTMLElement | null = null;
  private readonly OBSERVER_TIMEOUT = 30000; // 30 seconds timeout
  private readonly selector: string

  constructor({ selector }: ElementObserverOptions) {
    this.selector = selector
  }

  public observe(callback: (element: HTMLElement) => void): void {
    // Set timeout to stop observing if no video is found
    const timeoutId = window.setTimeout(() => {
      this.cleanupObserver();
      log('No video element found within timeout period');
    }, this.OBSERVER_TIMEOUT);

    this.observer = new MutationObserver(() => {
      const element: HTMLElement | null = document.querySelector(this.selector);
      if (element && !this.element) {
        callback(element)
        window.clearTimeout(timeoutId);
        this.element = element;

        // Setup video removal detection
        this.observeRemoval(element);
      }
    });

    // Start observing
    this.observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  private observeRemoval(element: HTMLElement): void {
    // Create a new observer specifically for the video element
    const videoObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === element) {
            this.cleanup();
          }
        });
      });
    });

    // Observe the video element's parent for removal
    if (element.parentNode) {
      videoObserver.observe(element.parentNode, {
        childList: true,
        subtree: false
      });
    }
  }

  public cleanup(): void {
    // Clean up observer
    this.cleanupObserver();

    // Reset element reference
    this.element = null;
  }

  private cleanupObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
