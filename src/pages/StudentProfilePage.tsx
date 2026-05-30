import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@/api/endpoints';
import { errorMessage } from '@/lib/formErrors';
import { formatDate, fullName } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconChevronRight, IconStudents } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { OverviewTab } from '@/features/students/profile/OverviewTab';
import { AttendanceTab } from '@/features/students/profile/AttendanceTab';
import { GradesTab } from '@/features/students/profile/GradesTab';
import { FeesTab } from '@/features/students/profile/FeesTab';
import { DocumentsTab } from '@/features/students/profile/DocumentsTab';

const TABS = ['Overview', 'Attendance', 'Grades', 'Fees', 'Documents'] as const;
type Tab = (typeof TABS)[number];

export function StudentProfilePage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState<Tab>('Overview');

  const { data: student, isLoading, isError, error } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id),
  });

  if (isError) {
    return (
      <Card>
        <EmptyState icon={<IconStudents />} title="Couldn't load student" description={errorMessage(error)} />
      </Card>
    );
  }

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted">
        <Link to="/students" className="hover:text-content">Students</Link>
        <IconChevronRight width={14} height={14} />
        <span className="text-content">{student ? fullName(student.firstName, student.lastName) : '…'}</span>
      </nav>

      <Card className="mb-5">
        <CardBody>
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : student ? (
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
          ) : null}
        </CardBody>
      </Card>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t ? 'border-teal-500 text-content' : 'border-transparent text-content-muted hover:text-content',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {!isLoading && student && (
        <>
          {tab === 'Overview' && <OverviewTab student={student} />}
          {tab === 'Attendance' && <AttendanceTab studentId={student.id} />}
          {tab === 'Grades' && <GradesTab studentId={student.id} />}
          {tab === 'Fees' && <FeesTab studentId={student.id} />}
          {tab === 'Documents' && <DocumentsTab studentId={student.id} />}
        </>
      )}
    </div>
  );
}
