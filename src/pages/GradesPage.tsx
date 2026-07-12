import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classesApi, gradesApi, subjectsApi } from '@/api/endpoints';
import { errorMessage } from '@/lib/formErrors';
import { fullName } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IconGrades } from '@/components/ui/icons';

const TERMS = ['Term 1', 'Term 2', 'Term 3'].map((t) => ({ value: t, label: t }));

interface Entry {
  score: string;
  maxScore: string;
}

export function GradesPage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [entries, setEntries] = useState<Record<string, Entry>>({});

  const { data: classes } = useQuery({ queryKey: ['classes', 'all'], queryFn: () => classesApi.list({ page: 1, limit: 100 }) });
  const { data: subjects } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => subjectsApi.list({ classId }),
    enabled: !!classId,
  });
  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ['roster', classId],
    queryFn: () => classesApi.roster(classId),
    enabled: !!classId,
  });
  const { data: grades } = useQuery({
    queryKey: ['grades', { subjectId, term }],
    queryFn: () => gradesApi.list({ subjectId, term }),
    enabled: !!subjectId && !!term,
  });

  useEffect(() => {
    const next: Record<string, Entry> = {};
    for (const g of grades?.data ?? []) next[g.studentId] = { score: g.score, maxScore: g.maxScore };
    setEntries(next);
  }, [grades]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const targets = (roster ?? []).filter((s) => entries[s.id]?.score !== undefined && entries[s.id]?.score !== '');
      await Promise.all(
        targets.map((s) => {
          const e = entries[s.id]!;
          return gradesApi.upsert({
            studentId: s.id,
            subjectId,
            term,
            score: Number(e.score),
            maxScore: Number(e.maxScore) || 100,
          });
        }),
      );
      return targets.length;
    },
    onSuccess: (count) => {
      toast.success(`Saved ${count} grade(s)`);
      qc.invalidateQueries({ queryKey: ['grades'] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const classOptions = useMemo(() => (classes?.data ?? []).map((c) => ({ value: c.id, label: `${c.name} ${c.section}` })), [classes]);
  const subjectOptions = useMemo(() => (subjects ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })), [subjects]);

  const ready = classId && subjectId && term;

  return (
    <div>
      <PageHeader title="Grades" description="Enter and review subject scores per term." />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select
            label="Class"
            placeholder="Select class"
            options={classOptions}
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSubjectId('');
            }}
          />
          <Select
            label="Subject"
            placeholder={classId ? 'Select subject' : 'Pick a class first'}
            options={subjectOptions}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          />
          <Select label="Term" options={TERMS} value={term} onChange={(e) => setTerm(e.target.value)} />
          <div className="flex items-end">
            <Button className="w-full" disabled={!ready || (roster?.length ?? 0) === 0} loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              Save grades
            </Button>
          </div>
        </CardBody>
      </Card>

      {!ready ? (
        <Card>
          <EmptyState icon={<IconGrades />} title="Select class, subject and term" description="Choose all three above to load the grade sheet." />
        </Card>
      ) : rosterLoading ? (
        <Card>
          <CardBody className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</CardBody>
        </Card>
      ) : (roster?.length ?? 0) === 0 ? (
        <Card>
          <EmptyState icon={<IconGrades />} title="No students enrolled" description="Enroll students in this class to enter grades." />
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Grade sheet — ${term}`} subtitle={`${roster?.length} students`} />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Max</th>
                  <th className="px-5 py-3 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {roster?.map((s) => {
                  const e = entries[s.id] ?? { score: '', maxScore: '100' };
                  const max = Number(e.maxScore) || 100;
                  const pct = e.score && max > 0 ? Math.round((Number(e.score) / max) * 1000) / 10 : null;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
                          <div>
                            <p className="font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                            <p className="text-xs text-content-subtle">{s.studentNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <Input
                          type="number"
                          className="h-9 w-24"
                          value={e.score}
                          onChange={(ev) => setEntries((m) => ({ ...m, [s.id]: { ...e, score: ev.target.value } }))}
                        />
                      </td>
                      <td className="px-5 py-2.5">
                        <Input
                          type="number"
                          className="h-9 w-24"
                          value={e.maxScore}
                          onChange={(ev) => setEntries((m) => ({ ...m, [s.id]: { ...e, maxScore: ev.target.value } }))}
                        />
                      </td>
                      <td className="px-5 py-2.5">
                        {pct !== null ? (
                          <StatusBadge tone={pct >= 50 ? 'success' : 'danger'}>{pct}%</StatusBadge>
                        ) : (
                          <span className="text-content-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
