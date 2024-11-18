// src/Popup.tsx
import { createSignal, onMount } from 'solid-js';
import { Switch } from '../Switch';
import styles from './Popup.module.css';
import { NO_SPOILER_STORAGE_KEY } from '../../constants';
import { log } from '../../utils/logger';

const Popup = () => {
  const [isEnabled, setIsEnabled] = createSignal(true);

  onMount(async () => {
    const result = await chrome.storage.local.get([NO_SPOILER_STORAGE_KEY]);
    const noSpoiler = result[NO_SPOILER_STORAGE_KEY] ?? true
    log("onMount noSpoiler", noSpoiler)
    setIsEnabled(noSpoiler);
  });

  const handleToggle = async (isEnabled: boolean) => {
    setIsEnabled(isEnabled);

    await chrome.storage.local.set({ [NO_SPOILER_STORAGE_KEY]: isEnabled });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && tab.url?.startsWith("https://tv.volleyballworld.com/")) {
      chrome.tabs.sendMessage(tab.id, { 
        type: 'NO_SPOILER_TOGGLE_STATE_CHANGED',
        enabled: isEnabled,
      });
    }
  };

  return (
    <div class={styles.popup}>
      <h1 class={styles.title}>VBTV spoiler settings</h1>
      <div class={styles.toggleRow}>
        <p>Spoiler-free mode</p>
        <Switch 
          checked={isEnabled()} 
          onChange={handleToggle}
        />
      </div>
      <div>
        <p class={styles.status}>
          {isEnabled()
            ? <>😌&nbsp;<span>Spoilers will be hidden across VBTV</span></>
            : <>😮&nbsp;<span>Spoilers will be shown normally</span></>
          }
        </p>
      </div>
      <hr class={styles.divider} />
      <div class={styles.footer}>
        <p>created by caaatisgood</p>
        <p><a href="https://github.com/caaatisgood/vbtv-spoiler-no-more/issues/new" target="_blank">feedback or bug reports 💬</a></p>
      </div>
    </div>
  );
};

export default Popup;
