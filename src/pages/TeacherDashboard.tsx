import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconStudents, IconAttendance, IconGrades, IconClasses } from '@/components/ui/icons';
import { dashboardApi } from '@/api/endpoints';
import type { DashboardData } from '@/types/models';

export function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Teacher Dashboard" description="Loading..." />
        <div className="text-sm text-content-muted">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Teacher Dashboard" description={`Welcome back, ${user?.email ?? 'Teacher'}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconClasses />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.totalClasses ?? '—'}</p>
              <p className="text-xs text-content-muted">My Classes</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600">
              <IconStudents />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.activeStudents ?? '—'}</p>
              <p className="text-xs text-content-muted">Total Students</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconAttendance />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.attendanceRateToday != null ? `${data.kpis.attendanceRateToday}%` : '—'}</p>
              <p className="text-xs text-content-muted">Attendance Today</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
              <IconGrades />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.totalStudents ?? '—'}</p>
              <p className="text-xs text-content-muted">Total Students (All)</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Enrollment by Class" />
          <CardBody>
            {data?.charts.enrollmentByClass && data.charts.enrollmentByClass.length > 0 ? (
              <div className="space-y-3">
                {data.charts.enrollmentByClass.map((c, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0">
                    <p className="text-sm font-medium text-content">{c.className}</p>
                    <span className="text-sm font-bold text-content">{c.count} students</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No classes found.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Alerts" />
          <CardBody>
            {data?.alerts && data.alerts.length > 0 ? (
              <div className="space-y-3">
                {data.alerts.map((a) => (
                  <div key={a.id} className={`rounded-lg border px-3 py-2 text-sm ${
                    a.severity === 'danger' ? 'border-red-500/30 bg-red-500/8 text-red-600' :
                    a.severity === 'warning' ? 'border-amber-500/30 bg-amber-500/8 text-amber-600' :
                    'border-blue-500/30 bg-blue-500/8 text-blue-600'
                  }`}>
                    {a.message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No alerts.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
