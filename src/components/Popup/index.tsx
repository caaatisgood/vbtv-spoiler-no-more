// src/Popup.tsx
import { createSignal, onMount } from 'solid-js';
import { Switch } from '../Switch';
import styles from './Popup.module.css';
import { SPOILER_FREE_STORAGE_KEY } from '../../constants';

const Popup = () => {
  const [isEnabled, setIsEnabled] = createSignal(true);

  onMount(async () => {
    const result = await chrome.storage.local.get(SPOILER_FREE_STORAGE_KEY);
    setIsEnabled(!!result[SPOILER_FREE_STORAGE_KEY]);
  });

  const handleToggle = async (newState: boolean) => {
    setIsEnabled(newState);
    
    await chrome.storage.local.set({ [SPOILER_FREE_STORAGE_KEY]: newState });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: 'SPOILER_FREE_TOGGLE_STATE_CHANGED',
        enabled: newState 
      });
    }
  };

  return (
    <div class={styles.popup}>
      <h1 class={styles.title}>VBTV spoiler no more settings</h1>
      <Switch 
        checked={isEnabled()} 
        onChange={handleToggle}
        label="Spoiler free"
      />
      <hr class={styles.divider} />
      <div class={styles.footer}>
        <p>created by caaatisgood</p>
        <p><a href="https://github.com/caaatisgood/vbtv-spoiler-no-more/issues/new">feedback or bug report</a></p>
      </div>
    </div>
  );
};

export default Popup;
