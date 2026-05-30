import { useQuery } from '@tanstack/react-query';
import { gradesApi } from '@/api/endpoints';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconGrades } from '@/components/ui/icons';

export function GradesTab({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['grades', { studentId }],
    queryFn: () => gradesApi.list({ studentId }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardBody className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</CardBody>
      </Card>
    );
  }
  if (!data || data.data.length === 0) {
    return (
      <Card>
        <EmptyState icon={<IconGrades />} title="No grades recorded" description="Grades will appear here once teachers enter them." />
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
              <th className="px-5 py-3 font-semibold">Subject</th>
              <th className="px-5 py-3 font-semibold">Term</th>
              <th className="px-5 py-3 font-semibold">Score</th>
              <th className="px-5 py-3 font-semibold">Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((g) => {
              const pct = Math.round((Number(g.score) / Number(g.maxScore)) * 1000) / 10;
              return (
                <tr key={g.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-content">{g.subject?.name ?? '—'}</td>
                  <td className="px-5 py-2.5">{g.term}</td>
                  <td className="px-5 py-2.5">{g.score}/{g.maxScore} ({pct}%)</td>
                  <td className="px-5 py-2.5"><StatusBadge tone={pct >= 50 ? 'success' : 'danger'}>{g.gradeLetter}</StatusBadge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
