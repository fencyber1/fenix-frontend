import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/api';

/** Role-based capability checks for conditional UI (server still enforces). */
export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);

  const is = (...roles: Role[]): boolean => (role ? roles.includes(role) : false);
  const isAdmin = is('SUPER_ADMIN', 'ADMIN');
  const isStaff = isAdmin || is('TEACHER');

  return {
    role,
    is,
    isAdmin,
    isStaff,
    canManageStudents: isAdmin,
    canEditStudents: isStaff,
    canMarkAttendance: isStaff,
    canGrade: isStaff,
    canManageFees: isAdmin,
    canManageClasses: isStaff,
    canManageStaff: isAdmin,
    canViewAudit: isAdmin,
    canViewDashboard: isStaff,
  };
}
