import { onCleanup, type Component, createEffect, createSignal, Show } from 'solid-js';
import { useLocation } from '@solidjs/router';

import { PAGE_PATHS, VIDEO_SELECTOR } from '../constants';
import { log } from '../utils/logger';
import { VideoController } from './VideoController';

import './App.css'

const App: Component = () => {
  const [videoController, setVideoController] = createSignal<VideoController | null>(null)
  const [playbackRate, setPlaybackRate] = createSignal<number>()
  const [visible, setVisible] = createSignal<boolean>()
  let visibleTimer: ReturnType<typeof setTimeout>;

  const { pathname } = useLocation();

  const cleanup = () => {
    if (videoController()) {
      videoController()?.cleanup()
      setVideoController(null)
    }
  }

  createEffect(() => {
    if (pathname === PAGE_PATHS.PLAYER) {
      if (!videoController()) {
        setVideoController(
          new VideoController({
            selector: VIDEO_SELECTOR,
            handlers: {
              onSetPlaybackRate: (value) => setPlaybackRate(value),
              onSetVolumn: () => {},
            }
          })
        );
      }
    } else {
      if (videoController()) {
        cleanup()
      }
    }
  })

  createEffect(() => {
    if (playbackRate()) {
      setVisible(true)
      if (visibleTimer) {
        clearTimeout(visibleTimer)
      }
      visibleTimer = setTimeout(() => {
        setVisible(false)
      }, 2000)
    }
  })

  onCleanup(() => {
    log("App onCleanup");
    cleanup()
  });

  return (
    <Show when={!!videoController()}>
      <div classList={{
        wrapper: true,
        visible: visible(),
      }}>
        <div class="playback">{playbackRate() ? `${playbackRate()}x` : null}</div>
      </div>
    </Show>
  );
}

export default App;
