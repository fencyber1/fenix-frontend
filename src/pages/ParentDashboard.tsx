import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconStudents, IconAttendance, IconGrades, IconFees, IconClasses, IconChevronRight } from '@/components/ui/icons';
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
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  const presentToday = data?.children.filter((c) => c.attendanceToday === 'PRESENT' || c.attendanceToday === 'LATE').length ?? 0;
  const avgGrade = data?.children && data.children.length > 0
    ? Math.round(data.children.reduce((sum, c) => sum + c.averageGrade, 0) / data.children.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Parent Dashboard"
        description={`Welcome back, ${user?.email ?? 'Parent'}`}
      />

      {/* ── KPI Cards ── */}
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
                  : `${presentToday}/${totalChildren}`}
              </p>
              <p className="text-xs text-content-muted">Present Today</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconGrades />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{avgGrade > 0 ? `${avgGrade}%` : '—'}</p>
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

      {/* ── Children Cards ── */}
      <div className="mt-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-content">My Children</h3>
        {data?.children && data.children.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.children.map((child) => (
              <Card key={child.id} className="transition-shadow hover:shadow-card-hover">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={child.name.split(' ')[0] ?? ''} lastName={child.name.split(' ').slice(1).join(' ') || ''} size="md" />
                      <div>
                        <h4 className="font-heading text-sm font-semibold text-content">{child.name}</h4>
                        <p className="text-xs text-content-muted">{child.studentNumber}</p>
                      </div>
                    </div>
                    <CircularProgress value={child.averageGrade} size={44} strokeWidth={3} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-3 px-3 py-2">
                    <IconClasses className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-content">{child.className}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className={`text-sm font-bold ${
                        child.attendanceToday === 'PRESENT' ? 'text-teal-600' :
                        child.attendanceToday === 'ABSENT' ? 'text-red-500' :
                        'text-content-muted'
                      }`}>
                        {child.attendanceToday === '—' ? '—' : child.attendanceToday}
                      </p>
                      <p className="text-[10px] text-content-subtle">Attendance</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-content">{child.averageGrade}%</p>
                      <p className="text-[10px] text-content-subtle">Grade Avg</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${child.pendingFees > 0 ? 'text-amber-600' : 'text-teal-600'}`}>
                        ${child.pendingFees.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-content-subtle">Pending</p>
                    </div>
                  </div>

                  {child.subjects.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-content-subtle">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {child.subjects.slice(0, 4).map((sub, i) => (
                          <span key={i} className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                            {sub.code}
                          </span>
                        ))}
                        {child.subjects.length > 4 && (
                          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-content-muted">
                            +{child.subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {child.recentGrades.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-content-subtle">Recent Grades</p>
                      <div className="space-y-1.5">
                        {child.recentGrades.slice(0, 3).map((gr, i) => {
                          const pct = Math.round((Number(gr.score) / Number(gr.maxScore)) * 100);
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-content-muted truncate">{gr.subject}</span>
                              <span className={`font-medium ${pct >= 50 ? 'text-teal-600' : 'text-red-500'}`}>
                                {gr.gradeLetter} ({pct}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Link to={`/children/${child.id}`} className="mt-4 block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile <IconChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="py-12 text-center">
              <IconStudents className="mx-auto mb-3 h-10 w-10 text-content-subtle" />
              <p className="text-sm text-content-muted">No children linked to your account yet.</p>
              <p className="mt-1 text-xs text-content-subtle">Contact your school administrator to link your children.</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* ── Fee Summary ── */}
      {data?.children && data.children.some((c) => c.pendingFees > 0) && (
        <div className="mt-6">
          <Card>
            <CardHeader title="Fee Summary" />
            <CardBody>
              <div className="space-y-3">
                {data.children.filter((c) => c.pendingFees > 0).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={c.name.split(' ')[0] ?? ''} lastName={c.name.split(' ').slice(1).join(' ') || ''} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-content">{c.name}</p>
                        <p className="text-xs text-content-muted">{c.className}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-600">${c.pendingFees.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
