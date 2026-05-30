import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/api';
import { Spinner } from '@/components/ui/Spinner';

/** Guards a route: requires authentication and (optionally) an allowed role. */
export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-2">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
