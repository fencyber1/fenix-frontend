import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-6">
          <h2 className="font-heading text-xl font-bold text-content">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
