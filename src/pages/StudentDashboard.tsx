import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconAttendance, IconGrades, IconFees, IconStudents } from '@/components/ui/icons';
import { dashboardApi } from '@/api/endpoints';
import type { StudentDashboardData } from '@/types/models';

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStudent().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Student Dashboard" description="Loading..." />
        <div className="text-sm text-content-muted">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Student Dashboard" description={`Welcome back, ${user?.email ?? 'Student'}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconAttendance />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.attendanceToday ?? '—'}</p>
              <p className="text-xs text-content-muted">Today's Attendance</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600">
              <IconGrades />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.averageGrade != null ? `${data.kpis.averageGrade}%` : '—'}</p>
              <p className="text-xs text-content-muted">Average Grade</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconFees />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.pendingFees != null ? `$${data.kpis.pendingFees.toFixed(2)}` : '—'}</p>
              <p className="text-xs text-content-muted">Pending Fees</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
              <IconStudents />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{data?.kpis.myClass ?? '—'}</p>
              <p className="text-xs text-content-muted">My Class</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Grades" />
          <CardBody>
            {data?.recentGrades && data.recentGrades.length > 0 ? (
              <div className="space-y-3">
                {data.recentGrades.map((g, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-content">{g.subject}</p>
                      <p className="text-xs text-content-muted">{g.term} · {new Date(g.recordedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-content">{g.score}/{g.maxScore} <span className="text-content-muted">({g.gradeLetter})</span></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No grades recorded yet.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Upcoming Fees" />
          <CardBody>
            {data?.upcomingFees && data.upcomingFees.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingFees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-content">{f.feeName}</p>
                      <p className="text-xs text-content-muted">Due {f.dueDate} · {f.status}</p>
                    </div>
                    <span className="text-sm font-bold text-content">
                      ${(f.amount - f.amountPaid).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No pending fees.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
