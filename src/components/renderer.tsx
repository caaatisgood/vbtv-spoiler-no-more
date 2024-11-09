import { render } from 'solid-js/web';
import { Router } from "@solidjs/router";
import App from './App';

export class Renderer {
  private rootId: string;

  constructor({ rootId }: {
    rootId: string;
  }) {
    this.rootId = rootId
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

    render(() => <Router root={App} />, root)
  }
}
