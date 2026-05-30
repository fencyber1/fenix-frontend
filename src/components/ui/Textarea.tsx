import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const tid = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-content">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={tid}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-xl border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-subtle',
            'transition-colors focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/40',
            error ? 'border-danger-500' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
