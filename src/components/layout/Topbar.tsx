import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Avatar } from '@/components/ui/Avatar';
import { IconLogout, IconMenu, IconMoon, IconSun } from '@/components/ui/icons';
import { NotificationsBell } from './NotificationsBell';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  STUDENT: 'Student',
};

export function Topbar({ onMenu, title }: { onMenu: () => void; title: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl p-2 text-content-muted hover:bg-surface-3 lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <h1 className="font-heading text-lg font-semibold text-content">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="rounded-xl p-2 text-content-muted hover:bg-surface-3 hover:text-content"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <NotificationsBell />

        <div className="relative ml-1">
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-3">
            <Avatar firstName={user?.email.charAt(0).toUpperCase() ?? 'U'} lastName={user?.email.charAt(1).toUpperCase() ?? ''} size="sm" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-medium text-content">{user?.email}</p>
                  <p className="text-xs text-content-muted">{user ? ROLE_LABEL[user.role] : ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-danger-500 hover:bg-surface-2"
                >
                  <IconLogout />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
