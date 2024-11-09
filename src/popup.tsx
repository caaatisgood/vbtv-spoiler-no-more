import { render } from 'solid-js/web';
import Popup from './components/Popup';

const root = document.getElementById('root');

if (root) {
  render(() => <Popup />, root);
}
