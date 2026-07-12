import type { Role } from '@/types/api';

/** Returns the default landing page for each role after login. */
export function homeForRole(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/dashboard';
    case 'TEACHER':
      return '/teacher';
    case 'STUDENT':
      return '/student';
    case 'PARENT':
      return '/parent';
    default:
      return '/dashboard';
  }
}
