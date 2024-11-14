/* @refresh reload */
import "./styles.css";

import { Renderer } from './components/renderer';
import { log } from './utils/logger';
import { ElementObserver } from './utils/elementObserver';
import { PAGE_PATHS, ROOT_ID, SPOILER_FREE_CLASS, SPOILER_FREE_STORAGE_KEY, VIDEO_SELECTOR } from './constants'
import { observeRouteChange } from './utils/routeChangeObserver';

log("🏐🏐🏐")

setupSpoilerFreeToggleListener();
initializeSpoilerFreeState();

function setupSpoilerFreeToggleListener() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SPOILER_FREE_TOGGLE_STATE_CHANGED') {
      handleSpoilerFreeToggleChange(message.enabled);
    }
  });
};

function handleSpoilerFreeToggleChange(enabled: boolean) {
  if (enabled === false) {
    document.body.classList.remove(SPOILER_FREE_CLASS);
  } else {
    document.body.classList.add(SPOILER_FREE_CLASS);
  }
};

// src/content/feature.ts
function initializeSpoilerFreeState() {
  // Check initial state when content script loads
  console.log("document.body", document.body)
  document.body.classList.add(SPOILER_FREE_CLASS);

  chrome.storage.local.get(SPOILER_FREE_STORAGE_KEY, (result) => {
    handleSpoilerFreeToggleChange(result[SPOILER_FREE_STORAGE_KEY])
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
