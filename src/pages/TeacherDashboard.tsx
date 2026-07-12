import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconStudents, IconAttendance, IconGrades, IconClasses } from '@/components/ui/icons';

export function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);

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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
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
              <p className="text-2xl font-bold text-content">—</p>
              <p className="text-xs text-content-muted">Pending Grades</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My Classes" />
          <CardBody>
            <p className="text-sm text-content-muted">No classes assigned yet.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent Activity" />
          <CardBody>
            <p className="text-sm text-content-muted">No recent activity.</p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
