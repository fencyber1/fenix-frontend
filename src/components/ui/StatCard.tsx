import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = 'teal',
  loading,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  tone?: 'teal' | 'amber' | 'navy' | 'danger';
  loading?: boolean;
}) {
  const toneClasses = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    navy: 'bg-navy-800/10 text-navy-700 dark:bg-white/10 dark:text-white',
    danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-300',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-content-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 font-heading text-2xl font-bold text-content">{value}</p>
          )}
          {trend && !loading && (
            <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-success-600' : 'text-danger-500')}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneClasses[tone])}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
