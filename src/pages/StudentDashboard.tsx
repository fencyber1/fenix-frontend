import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconAttendance, IconGrades, IconFees, IconStudents } from '@/components/ui/icons';

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
              <p className="text-xs text-content-muted">My Class</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Grades" />
          <CardBody>
            <p className="text-sm text-content-muted">No grades recorded yet.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Upcoming Fees" />
          <CardBody>
            <p className="text-sm text-content-muted">No pending fees.</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
