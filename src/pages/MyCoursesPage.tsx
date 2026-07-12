import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconClasses, IconGrades } from '@/components/ui/icons';
import { dashboardApi, subjectsApi } from '@/api/endpoints';
import { fullName } from '@/lib/utils';
import type { Subject } from '@/types/models';

export default function MyCoursesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classId, setClassId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    dashboardApi.getStudent().then((data) => {
      if (controller.signal.aborted) return;
      setClassId(data.kpis.classId);
      setClassName(data.kpis.myClass);
      if (data.kpis.classId) {
        return subjectsApi.list({ classId: data.kpis.classId });
      }
      return [];
    }).then((subRes) => {
      if (!controller.signal.aborted) setSubjects(Array.isArray(subRes) ? subRes : []);
    }).catch(() => {}).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <>
      <PageHeader
        title="My Courses"
        description={className ? `Subjects in ${className}` : 'View your enrolled subjects'}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : !classId ? (
        <Card>
          <EmptyState
            icon={<IconClasses />}
            title="No class assigned"
            description="You are not enrolled in any class yet. Contact your administrator."
          />
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconClasses />}
            title="No subjects yet"
            description="Your class does not have any subjects assigned yet."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.id} className="transition-shadow hover:shadow-card-hover">
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
                    <IconGrades />
                  </div>
                  <span className="rounded-lg bg-surface-3 px-2.5 py-1 text-xs font-medium text-content-muted">
                    {s.code}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-content">{s.name}</h3>
                {s.description && (
                  <p className="mt-1 text-sm text-content-muted line-clamp-2">{s.description}</p>
                )}
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  {s.teacher ? (
                    <>
                      <Avatar firstName={s.teacher.firstName} lastName={s.teacher.lastName} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-content">
                          {fullName(s.teacher.firstName, s.teacher.lastName)}
                        </p>
                        <p className="text-xs text-content-muted">Subject Teacher</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-content-muted">No teacher assigned</p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
