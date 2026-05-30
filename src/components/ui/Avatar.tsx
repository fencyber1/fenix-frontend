import { cn, initials } from '@/lib/utils';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({
  firstName,
  lastName,
  src,
  size = 'md',
  className,
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover ring-2 ring-border', sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-navy-800 font-semibold text-teal-300 ring-2 ring-border',
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials(firstName, lastName)}
    </span>
  );
}
