/* @refresh reload */
import "./styles.css";

import { Renderer } from './components/renderer';
import { log } from './utils/logger';
import { ElementObserver } from './utils/elementObserver';
import { PAGE_PATHS, ROOT_ID, 
  NO_SPOILER_STORAGE_KEY,
  WITH_SPOILER_CLASS,
  VIDEO_SELECTOR } from './constants'
import { observeRouteChange } from './utils/routeChangeObserver';

log("🏐🏐🏐")

setupSpoilerFreeToggleListener();
await initializeSpoilerFreeState();

function setupSpoilerFreeToggleListener() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'NO_SPOILER_TOGGLE_STATE_CHANGED') {
      log('NO_SPOILER_TOGGLE_STATE_CHANGED', message.enabled)
      handleNoSpoilerChange(message.enabled);
    }
  });
};

function handleNoSpoilerChange(noSpoiler: boolean) {
  if (!noSpoiler) {
    // add with spoiler class to enable spoiler styles
    document.body.classList.add(WITH_SPOILER_CLASS);
  } else {
    // remove with spoiler class to enable NO spoiler styles
    document.body.classList.remove(WITH_SPOILER_CLASS);
  }
};

// src/content/feature.ts
async function initializeSpoilerFreeState() {
  // Check initial state when content script loads
  await chrome.storage.local.get([NO_SPOILER_STORAGE_KEY], (result) => {
    const noSpoiler = result[NO_SPOILER_STORAGE_KEY] || false
    log("initializeSpoilerFreeState noSpoiler", noSpoiler)
    setTimeout(
      () => handleNoSpoilerChange(noSpoiler),
      noSpoiler === false
        ? 400 // delay applying spoiler styles on initialization to wait for source rendering
        : 0
    )
  });
};

let observer: ElementObserver | null;
let renderer: Renderer | null;

let cleanupRouteChangeObserver: ReturnType<typeof observeRouteChange>

handleRouteChange(window.location.pathname)

if (window.navigation) {
  window.navigation.addEventListener("navigate", (event) => {
    const url = new URL(event.destination.url)
    log('[navigate] location changed!', url.pathname);
    handleRouteChange(url.pathname)
  })
} else {
  cleanupRouteChangeObserver = observeRouteChange((pathname) => {
    log('[routeChangeObserver] route change:', pathname);
    handleRouteChange(pathname)
  });
}

function handleRouteChange(pathname: string) {
  if (pathname === PAGE_PATHS.PLAYER) {
    observer = new ElementObserver({ selector: VIDEO_SELECTOR })
    observer.observe(() => {
      renderer = createRenderer()
      renderer.render()
    })
  } else {
    log("Not on player page")
    cleanupObserver()
    cleanupRenderer()
  }
}

function cleanupObserver() {
  log("cleanupObserver()")
  if (observer) {
    observer.cleanup()
    observer = null
  }
}

function cleanupRenderer() {
  log("cleanupRenderer()")
  if (renderer) {
    renderer.destroy()
    renderer = null
  }
}

function createRenderer() {
  log("createRenderer")
  if (renderer) {
    return renderer
  }
  log("create new renderer")
  renderer = new Renderer({
    rootId: ROOT_ID,
  })
  return renderer
}

window.addEventListener('beforeunload', () => {
  log("beforeunload")
  if (cleanupRouteChangeObserver) {
    log("cleanupRouteChangeObserver()")
    cleanupRouteChangeObserver()
  }
  cleanupObserver()
  cleanupRenderer()
});
