/* @refresh reload */
import { Renderer } from './components/renderer';
import { log } from './utils/logger';
import { ElementObserver } from './utils/elementObserver';
import { PAGE_PATHS, VIDEO_SELECTOR } from './constants'
import { observeRouteChange } from './utils/routeChangeObserver';

log("🏐🏐🏐")

let observer: ElementObserver | null;
let renderer: Renderer | null;

let cleanupRouteChangeObserver: ReturnType<typeof observeRouteChange>

handleRouteChange(window.location.pathname)

// if (window.navigation) {
if (false) {
  window.navigation.addEventListener("navigate", (event) => {
    const url = new URL(event.destination.url)
    console.log('[navigate] location changed!', url.pathname);
    handleRouteChange(url.pathname)
  })
} else {
  cleanupRouteChangeObserver = observeRouteChange((pathname) => {
    console.log('[routeChangeObserver] route change:', pathname);
    handleRouteChange(pathname)
  });
}

function handleRouteChange(pathname: string) {
  if (pathname === PAGE_PATHS.PLAYER) {
    observer = new ElementObserver({ selector: VIDEO_SELECTOR })
    observer.observe(() => {
      log("Render root")
      renderer = createRenderer()
      renderer.render()
    })
  } else {
    log("Not on player page")
    cleanupObserver()
    cleanupRenderer()
  }
}

const cleanupObserver = () => {
  log("cleanupObserver()")
  if (observer) {
    observer.cleanup()
    observer = null
  }
}

const cleanupRenderer = () => {
  log("cleanupRenderer()")
  if (renderer) {
    renderer.destroy()
    renderer = null
  }
}

const createRenderer = () => {
  return new Renderer({
    rootId: "vbtv-spoiler-no-more"
  })
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
