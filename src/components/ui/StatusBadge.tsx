import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'teal';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-content-muted',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-100',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-100',
  info: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-100',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200',
};

const STATUS_TONES: Record<string, Tone> = {
  // student
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  GRADUATED: 'info',
  SUSPENDED: 'danger',
  WITHDRAWN: 'neutral',
  // attendance
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'info',
  // invoice
  PENDING: 'warning',
  PAID: 'success',
  PARTIAL: 'info',
  OVERDUE: 'danger',
  WAIVED: 'neutral',
  // verification
  VERIFIED: 'success',
  UNVERIFIED: 'warning',
};

export function StatusBadge({
  status,
  tone,
  children,
}: {
  status?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  const resolved: Tone = tone ?? (status ? STATUS_TONES[status] ?? 'neutral' : 'neutral');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        tones[resolved],
      )}
    >
      {children ?? status?.toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}
