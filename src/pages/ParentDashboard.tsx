import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconStudents, IconAttendance, IconGrades, IconFees } from '@/components/ui/icons';
import { dashboardApi } from '@/api/endpoints';
import type { ParentDashboardData } from '@/types/models';

export function ParentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getParent().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalChildren = data?.children.length ?? 0;

  if (loading) {
    return (
      <>
        <PageHeader title="Parent Dashboard" description="Loading..." />
        <div className="text-sm text-content-muted">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Parent Dashboard" description={`Welcome back, ${user?.email ?? 'Parent'}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconStudents />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{totalChildren}</p>
              <p className="text-xs text-content-muted">My Children</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600">
              <IconAttendance />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">
                {data?.children.every((c) => c.attendanceToday === '—')
                  ? '—'
                  : `${data?.children.filter((c) => c.attendanceToday === 'PRESENT' || c.attendanceToday === 'LATE').length ?? 0}/${totalChildren}`}
              </p>
              <p className="text-xs text-content-muted">Attendance Today</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconGrades />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">
                {data?.children && data.children.length > 0
                  ? `${Math.round(data.children.reduce((sum, c) => sum + c.averageGrade, 0) / data.children.length)}%`
                  : '—'}
              </p>
              <p className="text-xs text-content-muted">Avg. Grade</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
              <IconFees />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.overallPendingFees != null ? `$${data.overallPendingFees.toFixed(2)}` : '—'}</p>
              <p className="text-xs text-content-muted">Pending Fees</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My Children" />
          <CardBody>
            {data?.children && data.children.length > 0 ? (
              <div className="space-y-3">
                {data.children.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-content">{c.name}</p>
                      <p className="text-xs text-content-muted">{c.studentNumber} · {c.className}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-content">{c.averageGrade}%</p>
                      <p className="text-xs text-content-muted">Grade Avg</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No children linked yet.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Fee Summary" />
          <CardBody>
            {data?.children && data.children.length > 0 ? (
              <div className="space-y-3">
                {data.children.filter((c) => c.pendingFees > 0).map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-content">{c.name}</p>
                      <p className="text-xs text-content-muted">{c.className}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">${c.pendingFees.toFixed(2)}</span>
                  </div>
                ))}
                {data.children.every((c) => c.pendingFees === 0) && (
                  <p className="text-sm text-content-muted">No pending fees.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No fee information available.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
