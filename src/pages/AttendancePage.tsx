import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceApi, classesApi } from '@/api/endpoints';
import type { AttendanceStatus } from '@/types/api';
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
import { IconAttendance } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const STATUSES: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'PRESENT', label: 'Present', active: 'bg-success-500 text-white border-success-500' },
  { value: 'ABSENT', label: 'Absent', active: 'bg-danger-500 text-white border-danger-500' },
  { value: 'LATE', label: 'Late', active: 'bg-amber-500 text-navy-900 border-amber-500' },
  { value: 'EXCUSED', label: 'Excused', active: 'bg-info-500 text-white border-info-500' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.list({ page: 1, limit: 100 }),
  });

  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ['roster', classId],
    queryFn: () => classesApi.roster(classId),
    enabled: !!classId,
  });

  // Load existing attendance for the chosen class/date to pre-fill the grid.
  const { data: existing } = useQuery({
    queryKey: ['attendance', { classId, date }],
    queryFn: () => attendanceApi.list({ classId, from: date, to: date, limit: 100 }),
    enabled: !!classId && !!date,
  });

  useEffect(() => {
    const next: Record<string, AttendanceStatus> = {};
    for (const rec of existing?.data ?? []) next[rec.studentId] = rec.status;
    setMarks(next);
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () =>
      attendanceApi.bulkMark({
        classId,
        date,
        records: (roster ?? []).map((s) => ({ studentId: s.id, status: marks[s.id] ?? 'PRESENT' })),
      }),
    onSuccess: (res) => {
      toast.success(`Saved attendance for ${res.upserted} student(s)`);
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const classOptions = useMemo(
    () => (classes?.data ?? []).map((c) => ({ value: c.id, label: `${c.name} ${c.section} · ${c.academicYear}` })),
    [classes],
  );

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of roster ?? []) next[s.id] = status;
    setMarks(next);
  };

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    for (const s of roster ?? []) counts[marks[s.id] ?? 'PRESENT'] += 1;
    return counts;
  }, [roster, marks]);

  return (
    <div>
      <PageHeader title="Attendance" description="Select a class and date, then mark the register." />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Class"
            placeholder={classesLoading ? 'Loading…' : 'Select a class'}
            options={classOptions}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
          <Input label="Date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={!classId || !roster || roster.length === 0}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Save attendance
            </Button>
          </div>
        </CardBody>
      </Card>

      {!classId ? (
        <Card>
          <EmptyState icon={<IconAttendance />} title="Pick a class to begin" description="Choose a class above to load its register." />
        </Card>
      ) : rosterLoading ? (
        <Card>
          <CardBody className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardBody>
        </Card>
      ) : (roster?.length ?? 0) === 0 ? (
        <Card>
          <EmptyState icon={<IconAttendance />} title="No students enrolled" description="Enroll students in this class to mark attendance." />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={`Register — ${roster?.length} students`}
            subtitle={`Present ${summary.PRESENT} · Absent ${summary.ABSENT} · Late ${summary.LATE} · Excused ${summary.EXCUSED}`}
            action={
              <div className="hidden gap-1 sm:flex">
                {STATUSES.map((s) => (
                  <Button key={s.value} variant="outline" size="sm" onClick={() => markAll(s.value)}>
                    All {s.label}
                  </Button>
                ))}
              </div>
            }
          />
          <CardBody className="divide-y divide-border p-0">
            {roster?.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                    <p className="text-xs text-content-subtle">{s.studentNumber}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((st) => {
                    const active = (marks[s.id] ?? 'PRESENT') === st.value;
                    return (
                      <button
                        key={st.value}
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: st.value }))}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                          active ? st.active : 'border-border bg-surface text-content-muted hover:bg-surface-3',
                        )}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
