import { render } from 'solid-js/web';
import { Router } from "@solidjs/router";
import App from './App';

export class Renderer {
  private rootId: string;
  private dispose: () => void;

  constructor({ rootId }: {
    rootId: string;
  }) {
    this.rootId = rootId
    this.dispose = () => {}
  }

  private getRoot() {
    let root = document.getElementById(this.rootId);

    if (!root) {
      root = document.createElement('div')
      document.body.appendChild(root);
      root.id = this.rootId
    }

    return root
  }

  render() {
    const root = this.getRoot()
    
    if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
      throw new Error(
        'Root element not found',
      );
    }

    this.dispose = render(() => <Router root={App} />, root)
  }

  destroy() {
    this.dispose()
    const root = this.getRoot()
    root.remove();
  }
}
