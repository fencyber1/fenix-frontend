import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/attendance': 'Attendance',
  '/grades': 'Grades',
  '/fees': 'Fees',
  '/classes': 'Classes',
  '/staff': 'Staff',
  '/reports': 'Reports',
  '/audit': 'Audit Log',
  '/settings': 'Settings',
};

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const base = `/${location.pathname.split('/')[1] ?? ''}`;
  const title = TITLES[base] ?? 'Fenix';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-slide-in-right">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
