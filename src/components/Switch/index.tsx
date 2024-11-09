import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch = (props: SwitchProps) => {
  return (
    <div class={styles.wrapper}>
      <label class={styles.switch}>
        <input 
          type="checkbox" 
          checked={props.checked} 
          onChange={() => props.onChange(!props.checked)}
        />
        <span class={styles.slider}></span>
      </label>
      {props.label && <span class={styles.label}>{props.label}</span>}
    </div>
  );
};
