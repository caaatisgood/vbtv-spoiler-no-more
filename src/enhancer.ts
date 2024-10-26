import { log } from './utils/logger'

interface PlayerShortcuts {
  seek(seconds: number): void;
  seekFrame(frames: number): void;
  adjustVolume(delta: number): void;
  adjustPlaybackRate(delta: number): void;
  togglePlay(): void;
}

export class VBTVEnhancer implements PlayerShortcuts {
  private video: HTMLVideoElement | null = null;
  private observer: MutationObserver | null = null;
  private readonly FPS: number = 30;
  private readonly MIN_PLAYBACK_RATE: number = 0.20;
  private readonly MAX_PLAYBACK_RATE: number = 5;
  private readonly VOLUMN_DELTA = 0.05;
  private readonly PLAYBACK_RATE_DELTA = 0.20;
  private readonly OBSERVER_TIMEOUT = 30000; // 30 seconds timeout
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.setupCleanup();
    this.initializePlayer();
  }

  private initializePlayer(): void {
    log("initializePlayer")
    let timeoutId: number;

    this.observer = new MutationObserver(() => {
      const videoElement = document.querySelector('video');
      if (videoElement && !this.video) {
        this.video = videoElement;
        this.setupShortcuts();
        this.cleanupObserver();
        
        // Setup video removal detection
        this.observeVideoRemoval(videoElement);
      }
    });

    // Start observing with timeout
    this.observer.observe(document, {
      childList: true,
      subtree: true
    });

    // Set timeout to stop observing if no video is found
    timeoutId = window.setTimeout(() => {
      this.cleanupObserver();
      log('No video element found within timeout period');
    }, this.OBSERVER_TIMEOUT);
  }

  private observeVideoRemoval(videoElement: HTMLVideoElement): void {
    // Create a new observer specifically for the video element
    const videoObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === videoElement) {
            this.cleanup();
          }
        });
      });
    });

    // Observe the video element's parent for removal
    if (videoElement.parentNode) {
      videoObserver.observe(videoElement.parentNode, {
        childList: true,
        subtree: false
      });
    }
  }

  private setupCleanup(): void {
    // Clean up when navigating away
    window.addEventListener('beforeunload', () => this.cleanup());

    // Handle single-page app navigation
    window.addEventListener('popstate', () => this.cleanup());
    
    // Additional cleanup for single-page apps that might use pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      // Call original pushState
      originalPushState.apply(this, args);
      // Trigger cleanup
      window.dispatchEvent(new Event('pushstate'));
    };
    window.addEventListener('pushstate', () => this.cleanup());
  }

  private cleanupObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private cleanup(): void {
    // Clean up observer
    this.cleanupObserver();

    // Remove event listeners
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }

    // Clean up media session handlers
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('stop', null);
    }

    // Reset video reference
    this.video = null;
  }

  private setupShortcuts(): void {
    this.keydownListener = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        // Seek controls
        case 'arrowleft':
          this.seek(-5);
          break;
        case 'arrowright':
          this.seek(5);
          break;
        case 'j':
          this.seek(-10);
          break;
        case 'l':
          this.seek(10);
          break;
        case 'home':
          if (this.video) this.video.currentTime = 0;
          break;
        case 'end':
          if (this.video) this.video.currentTime = this.video.duration;
          break;

        // Volume controls
        case 'arrowup':
          this.adjustVolume(this.VOLUMN_DELTA);
          break;
        case 'arrowdown':
          this.adjustVolume(-this.VOLUMN_DELTA);
          break;
        case 'm':
          if (this.video) this.video.muted = !this.video.muted;
          break;

        // Playback controls
        case 'k':
          this.togglePlay();
          break;
        case '.':
          if (this.video?.paused) this.seekFrame(1);
          break;
        case ',':
          if (this.video?.paused) this.seekFrame(-1);
          break;
        case '>':
          this.adjustPlaybackRate(this.PLAYBACK_RATE_DELTA);
          break;
        case '<':
          this.adjustPlaybackRate(-this.PLAYBACK_RATE_DELTA);
          break;
      }
    };

    document.addEventListener('keydown', this.keydownListener);

    // Media key support
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('stop', () => {
        if (this.video) {
          this.video.pause();
          this.video.currentTime = 0;
        }
      });
    }
  }

  public seek(seconds: number): void {
    if (!this.video) return;
    this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
  }

  public seekFrame(frames: number): void {
    const frameDuration = 1 / this.FPS;
    this.seek(frameDuration * frames);
  }

  public adjustVolume(delta: number): void {
    if (!this.video) return;
    this.video.volume = Math.max(0, Math.min(1, this.video.volume + delta));
  }

  public adjustPlaybackRate(delta: number): void {
    if (!this.video) return;
    const newRate = Math.max(
      this.MIN_PLAYBACK_RATE,
      Math.min(this.MAX_PLAYBACK_RATE, this.video.playbackRate + delta)
    );
    this.video.playbackRate = newRate;
  }

  public togglePlay(): void {
    if (!this.video) return;
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }
}
