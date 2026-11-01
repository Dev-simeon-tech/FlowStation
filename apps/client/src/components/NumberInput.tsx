import { useRef, type InputHTMLAttributes, type Ref } from 'react';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  ref?: Ref<HTMLInputElement>;
}

export default function NumberInput({
  label,
  ref: forwardedRef,
  ...props
}: NumberInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="formGroup">
      {label && <label>{label}</label>}
      <div className="numberInput">
        <input
          ref={(input) => {
            ref.current = input;
            if (typeof forwardedRef === 'function') {
              forwardedRef(input);
            } else if (forwardedRef) {
              forwardedRef.current = input;
            }
          }}
          type="number"
          {...props}
        />
        <div className="numberBtns">
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
