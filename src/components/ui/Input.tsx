import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-10 w-full rounded-xl border bg-surface px-3 text-sm text-content placeholder:text-content-subtle',
              'transition-colors focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/40',
              leftIcon && 'pl-9',
              error ? 'border-danger-500' : 'border-border',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-danger-500">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-content-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full">
      {props.label && (
        <label htmlFor={props.id ?? props.name} className="mb-1.5 block text-sm font-medium text-content">
          {props.label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={props.id ?? props.name}
          type={show ? 'text' : 'password'}
          aria-invalid={!!props.error}
          className={cn(
            'h-10 w-full rounded-xl border bg-surface px-3 pr-10 text-sm text-content placeholder:text-content-subtle',
            'transition-colors focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/40',
            props.error ? 'border-danger-500' : 'border-border',
            props.className,
          )}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-content-subtle hover:bg-surface-3"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {props.error && <p className="mt-1 text-xs text-danger-500">{props.error}</p>}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-10-7-10-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
    </svg>
  );
}
