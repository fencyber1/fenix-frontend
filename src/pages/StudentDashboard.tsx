import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { BarChart } from '@/components/ui/BarChart';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { dashboardApi } from '@/api/endpoints';
import type { StudentDashboardData } from '@/types/models';
import { IconAttendance, IconFees } from '@/components/ui/icons';

export function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStudent().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Student Dashboard" description="Loading..." />
        <div className="space-y-4">
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="skeleton h-80 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  const firstName = data?.kpis.firstName ?? 'Student';

  return (
    <>
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${firstName}`}
        actions={
          <div className="flex gap-2">
            <Link to="/my-courses">
              <Button variant="outline">My Courses</Button>
            </Link>
            {data?.kpis.studentId && (
              <Link to={`/students/${data.kpis.studentId}`}>
                <Button>My Profile</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* ── Welcome Banner ── */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3b4f9e] via-[#4a5fba] to-[#6b7fd4] p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="font-heading text-2xl font-bold text-white">Hello {firstName}!</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              You have {data?.kpis.totalTasks ?? 0} graded tasks &amp; it is a lot of work for today!
              So let's start — review it!
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            {/* Illustration placeholder — desk SVG */}
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
              <rect x="30" y="80" width="140" height="8" rx="4" fill="white" fillOpacity="0.2" />
              <rect x="50" y="40" width="60" height="40" rx="6" fill="white" fillOpacity="0.15" />
              <rect x="55" y="45" width="50" height="30" rx="4" fill="white" fillOpacity="0.1" />
              <circle cx="140" cy="55" r="20" fill="white" fillOpacity="0.12" />
              <rect x="80" y="90" width="20" height="30" rx="4" fill="white" fillOpacity="0.15" />
              <rect x="110" y="90" width="20" height="30" rx="4" fill="white" fillOpacity="0.15" />
              <circle cx="150" cy="100" r="8" fill="white" fillOpacity="0.1" />
              <path d="M60 35 L80 15 L100 35" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Left Column: Performance + Teachers ── */}
        <div className="flex flex-col gap-5">
          {/* Performance Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-content">Performance</h3>
              <span className="rounded-lg bg-surface-3 px-3 py-1 text-xs font-medium text-content-muted">This Term</span>
            </div>
            {data?.subjectPerformance && data.subjectPerformance.length > 0 ? (
              <>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold text-content">{data.kpis.averageGrade}</span>
                  <span className="text-xs text-content-muted">Average</span>
                </div>
                <p className="mb-4 text-xs text-content-muted">The best lessons:</p>
                <BarChart
                  data={data.subjectPerformance.map((s) => ({ label: s.code, value: s.score }))}
                  height={130}
                />
              </>
            ) : (
              <p className="text-sm text-content-muted">No grades recorded yet.</p>
            )}
          </div>

          {/* Linked Teachers */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-content">Linked Teachers</h3>
              {data?.teachers && data.teachers.length > 3 && (
                <button className="text-xs font-medium text-teal-500 hover:text-teal-400">See all</button>
              )}
            </div>
            {data?.teachers && data.teachers.length > 0 ? (
              <div className="space-y-3">
                {data.teachers.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar firstName={t.firstName} lastName={t.lastName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-content truncate">
                        {t.firstName} {t.lastName} {i === 0 && <span className="text-content-muted">(mentor)</span>}
                      </p>
                      <p className="text-xs text-content-muted">{t.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-content-muted">No teachers assigned yet.</p>
            )}
          </div>
        </div>

        {/* ── Middle Column: My Visit (Attendance) ── */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-content">My Visit</h3>
              <span className="flex items-center gap-1.5 text-xs text-content-muted">
                <IconAttendance className="h-3.5 w-3.5" />
                Attendance
              </span>
            </div>
            {data?.subjectAttendance && data.subjectAttendance.length > 0 ? (
              <div className="grid grid-cols-3 gap-5">
                {data.subjectAttendance.map((s, i) => (
                  <CircularProgress
                    key={i}
                    value={s.percentage}
                    label={s.code}
                    size={80}
                    strokeWidth={5}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <IconAttendance className="mb-2 h-10 w-10 text-content-subtle" />
                <p className="text-sm text-content-muted">No attendance data yet.</p>
              </div>
            )}
          </div>

          {/* Upcoming Fees */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-content">Upcoming Fees</h3>
              <span className="flex items-center gap-1.5 text-xs text-content-muted">
                <IconFees className="h-3.5 w-3.5" />
                {data?.upcomingFees?.length ?? 0} pending
              </span>
            </div>
            {data?.upcomingFees && data.upcomingFees.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingFees.map((f) => {
                  const remaining = f.amount - f.amountPaid;
                  return (
                    <div key={f.id} className="flex items-center justify-between rounded-xl bg-surface-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-content truncate">{f.feeName}</p>
                        <p className="text-xs text-content-muted">Due {f.dueDate}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-amber-500">${remaining.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-content-muted">No pending fees.</p>
            )}
          </div>
        </div>

        {/* ── Right Column: My Class + Recent Grades ── */}
        <div className="flex flex-col gap-5">
          {/* My Class */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h3 className="mb-3 font-heading text-sm font-semibold text-content">My Class</h3>
            <div className="flex items-center gap-3 rounded-xl bg-surface-3 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-content">{data?.kpis.myClass ?? '—'}</p>
                <p className="text-xs text-content-muted">Current class assignment</p>
              </div>
            </div>
          </div>

          {/* Recent Grades */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-content">Recent Grades</h3>
            </div>
            {data?.recentGrades && data.recentGrades.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentGrades.map((g, i) => {
                  const pct = Math.round((Number(g.score) / Number(g.maxScore)) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-surface-3 px-3 py-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-xs font-bold text-teal-600">
                        {g.gradeLetter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content truncate">{g.subject}</p>
                        <p className="text-xs text-content-muted">{g.term}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-content">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-content-muted">No grades yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
