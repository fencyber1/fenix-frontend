import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { Logo } from './Logo';
import {
  IconAttendance,
  IconAudit,
  IconClasses,
  IconDashboard,
  IconFees,
  IconGrades,
  IconReports,
  IconSettings,
  IconStaff,
  IconStudents,
} from '@/components/ui/icons';
import type { ReactNode } from 'react';
import type { Role } from '@/types/api';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/student', label: 'My Dashboard', icon: <IconDashboard />, roles: ['STUDENT'] },
  { to: '/teacher', label: 'My Dashboard', icon: <IconDashboard />, roles: ['TEACHER'] },
  { to: '/parent', label: 'My Dashboard', icon: <IconDashboard />, roles: ['PARENT'] },
  { to: '/students', label: 'Students', icon: <IconStudents />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { to: '/attendance', label: 'Attendance', icon: <IconAttendance />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { to: '/grades', label: 'Grades', icon: <IconGrades />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { to: '/fees', label: 'Fees', icon: <IconFees />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { to: '/classes', label: 'Classes', icon: <IconClasses />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { to: '/staff', label: 'Staff', icon: <IconStaff />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/reports', label: 'Reports', icon: <IconReports />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { to: '/audit', label: 'Audit Log', icon: <IconAudit />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/settings', label: 'Settings', icon: <IconSettings />, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = usePermissions();
  const items = role ? NAV.filter((n) => n.roles.includes(role)) : [];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-500/12 text-teal-700 dark:text-teal-300'
                  : 'text-content-muted hover:bg-surface-3 hover:text-content',
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-content-subtle">Fenix SMS v1.0</p>
      </div>
    </aside>
  );
}
