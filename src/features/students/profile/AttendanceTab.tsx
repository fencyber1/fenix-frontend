import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/endpoints';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconAttendance } from '@/components/ui/icons';
import { formatDate } from '@/lib/utils';

export function AttendanceTab({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance', { studentId }],
    queryFn: () => attendanceApi.list({ studentId, limit: 60 }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardBody className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</CardBody>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <EmptyState icon={<IconAttendance />} title="No attendance records" description="This student has no attendance history yet." />
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((rec) => (
              <tr key={rec.id} className="border-b border-border last:border-0">
                <td className="px-5 py-2.5">{formatDate(rec.date)}</td>
                <td className="px-5 py-2.5"><StatusBadge status={rec.status} /></td>
                <td className="px-5 py-2.5 text-content-muted">{rec.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
