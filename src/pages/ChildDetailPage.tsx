import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconStudents, IconClasses, IconAttendance, IconGrades } from '@/components/ui/icons';
import { studentsApi, subjectsApi, attendanceApi, gradesApi } from '@/api/endpoints';
import { formatDate, fullName } from '@/lib/utils';
import type { Student, Subject, AttendanceRecord, Grade } from '@/types/models';

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const controller = new AbortController();
    Promise.all([
      studentsApi.get(id),
      attendanceApi.list({ studentId: id, limit: 10 }),
      gradesApi.list({ studentId: id }),
    ]).then(([s, attRes, gradRes]) => {
      if (controller.signal.aborted) return;
      setStudent(s);
      setAttendance(attRes.data ?? []);
      setGrades(gradRes.data ?? []);
      return subjectsApi.list({});
    }).then((subRes) => {
      if (!controller.signal.aborted) setSubjects(Array.isArray(subRes) ? subRes : []);
    }).catch(() => {}).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader title="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageHeader title="Student not found" />
        <Card>
          <EmptyState
            icon={<IconStudents />}
            title="Student not found"
            description="This student profile may have been deleted."
            action={<Link to="/parent"><Button>Back to Dashboard</Button></Link>}
          />
        </Card>
      </>
    );
  }

  const avgGrade = grades.length > 0
    ? Math.round((grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) / grades.length) * 10) / 10
    : 0;

  const presentCount = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title={fullName(student.firstName, student.lastName)}
        description={student.studentNumber}
        actions={
          <Link to="/parent" className="text-sm font-medium text-teal-500 hover:text-teal-400">
            ← Back to Dashboard
          </Link>
        }
      />

      {/* ── Student Info Card ── */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar firstName={student.firstName} lastName={student.lastName} src={student.photoUrl} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl font-bold text-content">{fullName(student.firstName, student.lastName)}</h2>
                <StatusBadge status={student.status} />
              </div>
              <p className="mt-1 text-sm text-content-muted">
                {student.studentNumber} · {student.gender.toLowerCase()} · Admitted {formatDate(student.admissionDate)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-4">
            <CircularProgress value={attendanceRate} size={48} strokeWidth={4} />
            <div>
              <p className="text-2xl font-bold text-content">{attendanceRate}%</p>
              <p className="text-xs text-content-muted">Attendance</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconClasses />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{subjects.length}</p>
              <p className="text-xs text-content-muted">Subjects</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* ── Subjects ── */}
        <Card>
          <CardHeader title="Subjects" />
          <CardBody>
            {subjects.length === 0 ? (
              <EmptyState icon={<IconClasses />} title="No subjects" description="No subjects assigned yet." />
            ) : (
              <div className="space-y-2">
                {subjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-content">{s.name}</p>
                      <p className="text-xs text-content-muted">{s.code}</p>
                    </div>
                    {s.teacher && (
                      <span className="text-xs text-content-muted">
                        {fullName(s.teacher.firstName, s.teacher.lastName)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Recent Grades ── */}
        <Card>
          <CardHeader title="Recent Grades" />
          <CardBody>
            {grades.length === 0 ? (
              <EmptyState icon={<IconGrades />} title="No grades" description="No grades recorded yet." />
            ) : (
              <div className="space-y-2">
                {grades.slice(0, 8).map((g) => {
                  const pct = Math.round((Number(g.score) / Number(g.maxScore)) * 100);
                  return (
                    <div key={g.id} className="flex items-center gap-3 rounded-xl bg-surface-3 px-3 py-2.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        pct >= 50 ? 'bg-teal-500/12 text-teal-600' : 'bg-red-500/12 text-red-500'
                      }`}>
                        {g.gradeLetter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content truncate">{g.subject?.name ?? '—'}</p>
                        <p className="text-xs text-content-muted">{g.term}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-content">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Recent Attendance ── */}
      <div className="mt-6">
        <Card>
          <CardHeader title="Recent Attendance" />
          <CardBody>
            {attendance.length === 0 ? (
              <EmptyState icon={<IconAttendance />} title="No attendance records" description="No attendance history yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 10).map((rec) => (
                      <tr key={rec.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-2.5">{formatDate(rec.date)}</td>
                        <td className="px-5 py-2.5"><StatusBadge status={rec.status} /></td>
                        <td className="px-5 py-2.5 text-content-muted">{rec.note ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
