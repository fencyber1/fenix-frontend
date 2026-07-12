import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { setUnauthorizedHandler } from '@/api/client';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/Spinner';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { StudentProfilePage } from '@/pages/StudentProfilePage';

// Code-split heavier routes (charts / PDF / tables) so the initial bundle stays lean.
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AttendancePage = lazy(() => import('@/pages/AttendancePage').then((m) => ({ default: m.AttendancePage })));
const GradesPage = lazy(() => import('@/pages/GradesPage').then((m) => ({ default: m.GradesPage })));
const FeesPage = lazy(() => import('@/pages/FeesPage').then((m) => ({ default: m.FeesPage })));
const ClassesPage = lazy(() => import('@/pages/ClassesPage').then((m) => ({ default: m.ClassesPage })));
const StaffPage = lazy(() => import('@/pages/StaffPage').then((m) => ({ default: m.StaffPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AuditPage = lazy(() => import('@/pages/AuditPage').then((m) => ({ default: m.AuditPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const clear = useAuthStore((s) => s.clear);
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initTheme();
    setUnauthorizedHandler(() => clear());
    void bootstrap();
  }, [bootstrap, clear, initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
                <Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
                <Suspense fallback={<PageFallback />}><AttendancePage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
                <Suspense fallback={<PageFallback />}><GradesPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/fees" element={<Suspense fallback={<PageFallback />}><FeesPage /></Suspense>} />
          <Route
            path="/classes"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
                <Suspense fallback={<PageFallback />}><ClassesPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                <Suspense fallback={<PageFallback />}><StaffPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER']}>
                <Suspense fallback={<PageFallback />}><ReportsPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                <Suspense fallback={<PageFallback />}><AuditPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
