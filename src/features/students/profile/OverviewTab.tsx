import type { Student } from '@/types/models';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-content-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-content">{value || '—'}</dd>
    </div>
  );
}

export function OverviewTab({ student }: { student: Student }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Personal information" />
        <CardBody>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="First name" value={student.firstName} />
            <Field label="Last name" value={student.lastName} />
            <Field label="Date of birth" value={student.dob ? formatDate(student.dob) : 'Restricted'} />
            <Field label="Gender" value={student.gender} />
            <Field label="Blood group" value={student.bloodGroup} />
            <Field label="Status" value={student.status} />
            <Field label="Address" value={student.address} />
          </dl>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Enrollment & records" />
        <CardBody>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Student number" value={student.studentNumber} />
            <Field label="Admission date" value={formatDate(student.admissionDate)} />
            <Field label="Medical notes" value={student.medicalNotes ?? 'Restricted / none'} />
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
