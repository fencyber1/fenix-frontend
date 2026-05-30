import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardApi } from '@/api/endpoints';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { errorMessage } from '@/lib/formErrors';
import { formatMoney } from '@/lib/utils';
import {
  IconAlert,
  IconAttendance,
  IconClasses,
  IconFees,
  IconStaff,
  IconStudents,
} from '@/components/ui/icons';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PAID: '#16A34A',
  PARTIAL: '#2563EB',
  OVERDUE: '#DC2626',
  WAIVED: '#78849E',
};

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
  });

  if (isError) {
    return (
      <Card>
        <EmptyState icon={<IconAlert />} title="Couldn't load dashboard" description={errorMessage(error)} />
      </Card>
    );
  }

  const k = data?.kpis;

  return (
    <div>
      <PageHeader title="Dashboard" description="A live snapshot of your school." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={isLoading} label="Total Students" value={k?.totalStudents ?? 0} icon={<IconStudents />} tone="teal" />
        <StatCard loading={isLoading} label="Active Students" value={k?.activeStudents ?? 0} icon={<IconStudents />} tone="navy" />
        <StatCard loading={isLoading} label="Classes" value={k?.totalClasses ?? 0} icon={<IconClasses />} tone="navy" />
        <StatCard loading={isLoading} label="Staff" value={k?.totalStaff ?? 0} icon={<IconStaff />} tone="navy" />
        <StatCard
          loading={isLoading}
          label="Attendance Today"
          value={`${k?.attendanceRateToday ?? 0}%`}
          icon={<IconAttendance />}
          tone="teal"
        />
        <StatCard
          loading={isLoading}
          label="Collected (Month)"
          value={formatMoney(k?.collectedThisMonth ?? 0)}
          icon={<IconFees />}
          tone="teal"
        />
        <StatCard
          loading={isLoading}
          label="Outstanding Fees"
          value={formatMoney(k?.outstandingFees ?? 0)}
          icon={<IconFees />}
          tone="amber"
        />
      </div>

      {/* Alerts */}
      {data && data.alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                a.severity === 'danger'
                  ? 'border-danger-500/30 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100'
                  : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
              }`}
            >
              <IconAlert />
              {a.message}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Attendance — last 7 days" />
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.charts.attendanceTrend ?? []}>
                  <defs>
                    <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C2CB" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00C2CB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--content-subtle))' }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--content-subtle))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgb(var(--border))',
                      background: 'rgb(var(--surface))',
                      color: 'rgb(var(--content))',
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#00C2CB" strokeWidth={2} fill="url(#present)" name="Present" />
                  <Area type="monotone" dataKey="absent" stroke="#DC2626" strokeWidth={2} fillOpacity={0} name="Absent" />
                  <Area type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} fillOpacity={0} name="Late" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fee status" />
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : (data?.charts.feeStatusBreakdown.length ?? 0) === 0 ? (
              <EmptyState title="No invoices yet" description="Fee status will appear once invoices exist." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data?.charts.feeStatusBreakdown ?? []}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(data?.charts.feeStatusBreakdown ?? []).map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#78849E'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgb(var(--border))',
                      background: 'rgb(var(--surface))',
                      color: 'rgb(var(--content))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Enrollment by class" />
        <CardBody>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (data?.charts.enrollmentByClass.length ?? 0) === 0 ? (
            <EmptyState title="No classes yet" description="Create classes and enroll students to see this chart." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.charts.enrollmentByClass ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="className" tick={{ fontSize: 11, fill: 'rgb(var(--content-subtle))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--content-subtle))' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--surface-3))' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgb(var(--border))',
                    background: 'rgb(var(--surface))',
                    color: 'rgb(var(--content))',
                  }}
                />
                <Bar dataKey="count" fill="#00C2CB" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
