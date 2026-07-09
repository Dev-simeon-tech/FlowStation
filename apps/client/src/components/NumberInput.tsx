import { useRef, type InputHTMLAttributes } from 'react';
import s from '../styles/shared.module.css';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function NumberInput({ label, ...props }: NumberInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={s.formGroup}>
      {label && <label>{label}</label>}
      <div className={s.numberInput}>
        <input ref={ref} type="number" {...props} />
        <div className={s.numberBtns}>
          <button type="button" tabIndex={-1} aria-label="Increase"
            onClick={() => {
              ref.current?.stepUp();
              ref.current?.dispatchEvent(new Event('change', { bubbles: true }));
            }}
          >&#9650;</button>
          <button type="button" tabIndex={-1} aria-label="Decrease"
            onClick={() => {
              ref.current?.stepDown();
              ref.current?.dispatchEvent(new Event('change', { bubbles: true }));
            }}
          >&#9660;</button>
        </div>
      </div>
    </div>
  );
}
