import { log } from './src/utils/logger'
import { VBTVEnhancer } from './src/enhancer'

log("🏐🏐🏐")

const PAGE_PATHNAME = {
  PLAYER: '/player'
}

// Initialize the enhancer when the page loads
window.addEventListener('load', () => {
  if (window.location.pathname !== PAGE_PATHNAME.PLAYER) {
    log("Not the player page")
    return
  }
  new VBTVEnhancer();
});
