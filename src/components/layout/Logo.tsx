import { cn } from '@/lib/utils';

/** Fenix wordmark with a phoenix-flame glyph. */
export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2c1.5 3 0 5-1 6.5C9.5 10.5 9 12 10 13.5c.8 1.2.5 2.5-.5 3.5 2.5.3 4.5-1.3 5-3.8.6 1 1 2.2.8 3.6 2-1.8 2.7-4.8 1.4-7.6C15.8 8 14 6.5 14.5 4 13.8 4.6 13 5.6 12.7 7 12.2 5 12.4 3.4 12 2z"
            fill="#0F1C3F"
          />
          <path
            d="M9 16.5c-.6 1.3-.3 2.8.8 3.8-2.4.2-4.4-1.3-4.6-3.8 0-.5.1-1 .3-1.5.5.8 1.3 1.4 2.3 1.5.4 0 .8 0 1.2 0z"
            fill="#0F1C3F"
          />
        </svg>
      </span>
      {!collapsed && (
        <span className="font-heading text-xl font-bold tracking-tight text-content">
          Fenix
        </span>
      )}
    </div>
  );
}
