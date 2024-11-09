/* @refresh reload */
import { Renderer } from './components/renderer';
import { log } from './utils/logger';
import { ElementObserver } from './utils/elementObserver';
import { PAGE_PATHS, VIDEO_SELECTOR } from './constants'

log("🏐🏐🏐")

let observer: ElementObserver;

if (window.location.pathname === PAGE_PATHS.PLAYER) {
  observer = new ElementObserver({ selector: VIDEO_SELECTOR })
  observer.observe(() => {
    log("Render root")
    const renderer = new Renderer({
      rootId: "vbtv-spoiler-no-more"
    })
    renderer.render()
  })
  
  window.addEventListener('beforeunload', () => {
    if (observer) {
      observer.cleanup()
    }
  });
} else {
  log("Not the player page")
}
