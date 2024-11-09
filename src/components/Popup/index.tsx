// src/Popup.tsx
import { createSignal, onMount } from 'solid-js';
import { Switch } from '../Switch';
import styles from './Popup.module.css';

const Popup = () => {
  const [isEnabled, setIsEnabled] = createSignal(false);

  onMount(async () => {
    const result = await chrome.storage.local.get('isEnabled');
    setIsEnabled(!!result.isEnabled);
  });

  const handleToggle = async (newState: boolean) => {
    setIsEnabled(newState);
    
    await chrome.storage.local.set({ isEnabled: newState });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: 'TOGGLE_STATE_CHANGED',
        enabled: newState 
      });
    }
  };

  return (
    <div class={styles.popup}>
      <Switch 
        checked={isEnabled()} 
        onChange={handleToggle}
        label="Enable Feature"
      />
    </div>
  );
};

export default Popup;
