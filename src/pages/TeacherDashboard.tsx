import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { IconClasses, IconStudents, IconGrades, IconAttendance, IconPlus, IconChevronRight } from '@/components/ui/icons';
import { classesApi, subjectsApi } from '@/api/endpoints';
import { fullName } from '@/lib/utils';
import type { SchoolClass, Subject } from '@/types/models';

export function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      classesApi.list({ page: 1, limit: 100 }).catch(() => ({ data: [], meta: null })),
      subjectsApi.list({}).catch(() => []),
    ]).then(([classRes, subRes]) => {
      if (!controller.signal.aborted) {
        setClasses(classRes.data ?? []);
        setSubjects(Array.isArray(subRes) ? subRes : []);
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0);
  const totalSubjects = subjects.length;

  return (
    <>
      <PageHeader
        title="Teacher Dashboard"
        description={`Welcome back, ${user?.email ?? 'Teacher'}`}
        actions={
          <Link to="/classes">
            <Button>
              <IconPlus /> My Classes
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconClasses />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{loading ? '—' : classes.length}</p>
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
              <p className="text-2xl font-bold text-content">{loading ? '—' : totalStudents}</p>
              <p className="text-xs text-content-muted">Total Students</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
              <IconGrades />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{loading ? '—' : totalSubjects}</p>
              <p className="text-xs text-content-muted">Subjects</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconAttendance />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{loading ? '—' : classes.length > 0 ? Math.round(totalStudents / classes.length) : 0}</p>
              <p className="text-xs text-content-muted">Avg. Class Size</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My Classes" />
          <CardBody>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-3" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-content-muted">No classes assigned yet.</p>
                <Link to="/classes" className="mt-2 inline-block text-sm font-medium text-teal-600 hover:underline">
                  View all classes
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {classes.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    to={`/classes/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/12 text-teal-600">
                        <IconClasses />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-content">{c.name} {c.section}</p>
                        <p className="text-xs text-content-muted">
                          {c._count?.enrollments ?? 0} students · {c._count?.subjects ?? 0} subjects
                        </p>
                      </div>
                    </div>
                    <IconChevronRight className="text-content-subtle" />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Subjects I Teach" />
          <CardBody>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-3" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-content-muted">No subjects assigned yet.</p>
                <p className="text-xs text-content-subtle mt-1">Subjects will appear once an admin assigns you.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-content">{s.name}</p>
                      <p className="text-xs text-content-muted">
                        {s.code} · {s.class?.name} {s.class?.section}
                      </p>
                    </div>
                    <span className="rounded-lg bg-purple-500/12 px-2 py-1 text-xs font-medium text-purple-600">
                      {s.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {classes.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader title="Class Overview" />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((c) => {
                  const capacity = c.capacity;
                  const enrolled = c._count?.enrollments ?? 0;
                  const percentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
                  return (
                    <Link
                      key={c.id}
                      to={`/classes/${c.id}`}
                      className="rounded-xl border border-border p-4 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-heading text-sm font-semibold text-content">{c.name} {c.section}</h4>
                          <p className="text-xs text-content-muted">Year {c.academicYear}</p>
                        </div>
                        <CircularProgress value={percentage} size={40} strokeWidth={3} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
                        <span>{enrolled}/{capacity} students</span>
                        <span>{c._count?.subjects ?? 0} subjects</span>
                      </div>
                      {c.classTeacher && (
                        <p className="mt-2 text-xs text-content-subtle">
                          Teacher: {fullName(c.classTeacher.firstName, c.classTeacher.lastName)}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
