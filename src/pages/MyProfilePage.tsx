import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconStudents } from '@/components/ui/icons';
import { dashboardApi } from '@/api/endpoints';
import { formatDate, fullName } from '@/lib/utils';
import type { Student } from '@/types/models';
import { api } from '@/api/client';

export default function MyProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    dashboardApi.getStudent()
      .then((data) => {
        if (controller.signal.aborted) return;
        const sid = data.kpis.studentId;
        if (!sid) return;
        return api.get(`/students/${sid}`).then((res) => res.data.data as Student);
      })
      .then((s) => { if (!controller.signal.aborted && s) setStudent(s); })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="My Profile" />
        <Card>
          <CardBody className="space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardBody>
        </Card>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageHeader title="My Profile" />
        <Card>
          <EmptyState
            icon={<IconStudents />}
            title="No profile found"
            description="Your student profile has not been created yet."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        description={student.studentNumber}
        actions={
          <Link to={`/students/${student.id}`} className="text-sm font-medium text-teal-500 hover:text-teal-400">
            View Full Profile →
          </Link>
        }
      />

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-4 font-heading text-sm font-semibold text-content">Personal Information</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="First name" value={student.firstName} />
              <Field label="Last name" value={student.lastName} />
              <Field label="Date of birth" value={student.dob ? formatDate(student.dob) : '—'} />
              <Field label="Gender" value={student.gender} />
              <Field label="Blood group" value={student.bloodGroup} />
              <Field label="Phone" value={student.phone} />
              <Field label="Address" value={student.address} />
              <Field label="Status" value={student.status} />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="mb-4 font-heading text-sm font-semibold text-content">Academic Records</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Student number" value={student.studentNumber} />
              <Field label="Display ID" value={student.displayId ?? '—'} />
              <Field label="Admission date" value={formatDate(student.admissionDate)} />
              <Field label="Medical notes" value={student.medicalNotes ?? 'None'} />
            </dl>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-content-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-content">{value || '—'}</dd>
    </div>
  );
}
