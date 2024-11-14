import { log } from "../utils/logger";

interface PlayerShortcuts {
  seek(seconds: number): void;
  seekFrame(frames: number): void;
  adjustVolume(delta: number): void;
  adjustPlaybackRate(delta: number): void;
  togglePlay(): void;
}

interface VideoControllerOptions {
  selector: string;
  handlers: {
    onSetPlaybackRate: (value: number) => void,
    onSetVolumn: (value: number) => void,
  };
}

export class VideoController implements PlayerShortcuts {
  private selector: string;
  private video: HTMLVideoElement | null = null;  
  private readonly FPS: number = 30;
  private readonly MIN_PLAYBACK_RATE: number = 0.20;
  private readonly MAX_PLAYBACK_RATE: number = 5;
  private readonly VOLUMN_DELTA = 0.05;
  private readonly PLAYBACK_RATE_DELTA = 0.20;
  private handlers: VideoControllerOptions["handlers"];
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  constructor({
    selector,
    handlers,
  }: VideoControllerOptions) {
    this.selector = selector
    this.handlers = handlers
    this.getVideo()
    this.setupShortcuts()
  }

  private getVideo() {
    this.video = document.querySelector(this.selector)
    return this.video
  }

  private setupShortcuts(): void {
    if (!this.video) {
      log("unable to setupShortcuts() because `this.video` does not exist")
      return
    }
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
        case ' ':
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

  public cleanup(): void {
    log("VideoController.cleanup()")
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
    const volumn = Math.max(0, Math.min(1, this.video.volume + delta));
    this.video.volume = volumn;
    this.handlers.onSetVolumn(volumn);
  }

  public adjustPlaybackRate(delta: number): void {
    if (!this.video) return;
    const rate = Math.max(
      this.MIN_PLAYBACK_RATE,
      Math.min(
        this.MAX_PLAYBACK_RATE,
        this.video.playbackRate + delta
      )
    );
    const formattedRate = parseFloat(parseFloat((rate).toString()).toPrecision(2))
    this.video.playbackRate = formattedRate
    this.handlers.onSetPlaybackRate(formattedRate)
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
