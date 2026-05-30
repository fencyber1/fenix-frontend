import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceApi, classesApi, gradesApi, studentsApi } from '@/api/endpoints';
import { errorMessage } from '@/lib/formErrors';
import { generateReportCardPdf } from '@/features/pdf/generate';
import { fullName } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconDownload, IconReports } from '@/components/ui/icons';

const TERMS = ['Term 1', 'Term 2', 'Term 3'].map((t) => ({ value: t, label: t }));

export function ReportsPage() {
  const [tab, setTab] = useState<'report-card' | 'attendance'>('report-card');

  return (
    <div>
      <PageHeader title="Reports" description="Generate report cards and attendance summaries." />
      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'report-card' ? 'primary' : 'outline'} onClick={() => setTab('report-card')}>
          Report cards
        </Button>
        <Button variant={tab === 'attendance' ? 'primary' : 'outline'} onClick={() => setTab('attendance')}>
          Attendance
        </Button>
      </div>
      {tab === 'report-card' ? <ReportCardBuilder /> : <AttendanceReportBuilder />}
    </div>
  );
}

function ReportCardBuilder() {
  const [studentId, setStudentId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['students', 'report-search', search],
    queryFn: () => studentsApi.list({ page: 1, limit: 20, search: search || undefined }),
  });

  const { data: preview, isFetching } = useQuery({
    queryKey: ['report-card', studentId, term],
    queryFn: () => gradesApi.reportCard(studentId, term),
    enabled: !!studentId && !!term,
  });

  const studentOptions = useMemo(
    () => (students?.data ?? []).map((s) => ({ value: s.id, label: `${fullName(s.firstName, s.lastName)} (${s.studentNumber})` })),
    [students],
  );

  const handleExport = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await generateReportCardPdf(preview);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Report card builder" subtitle="Select a student and term to preview and export." />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Search student" placeholder="Name or number…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Student" placeholder="Select student" options={studentOptions} value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <Select label="Term" options={TERMS} value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>

        {!studentId ? (
          <EmptyState icon={<IconReports />} title="Select a student" description="Search and choose a student to preview their report card." />
        ) : isFetching ? (
          <p className="py-8 text-center text-sm text-content-muted">Loading preview…</p>
        ) : preview && preview.subjects.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
                    <th className="px-4 py-2 font-semibold">Subject</th>
                    <th className="px-4 py-2 font-semibold">Score</th>
                    <th className="px-4 py-2 font-semibold">%</th>
                    <th className="px-4 py-2 font-semibold">Grade</th>
                    <th className="px-4 py-2 font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.subjects.map((s) => (
                    <tr key={s.code} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium text-content">{s.subject}</td>
                      <td className="px-4 py-2">{s.score}/{s.maxScore}</td>
                      <td className="px-4 py-2">{s.percentage}%</td>
                      <td className="px-4 py-2"><StatusBadge tone={s.percentage >= 50 ? 'success' : 'danger'}>{s.letter}</StatusBadge></td>
                      <td className="px-4 py-2 text-content-muted">{s.remark ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-2 p-4">
              <div className="flex gap-6 text-sm">
                <div><span className="text-content-muted">Average: </span><span className="font-semibold">{preview.summary.average}%</span></div>
                <div><span className="text-content-muted">GPA: </span><span className="font-semibold">{preview.summary.gpa}</span></div>
              </div>
              <Button onClick={handleExport} loading={busy}><IconDownload /> Export PDF</Button>
            </div>
          </>
        ) : (
          <EmptyState icon={<IconReports />} title="No grades for this term" description="This student has no recorded grades for the selected term yet." />
        )}
      </CardBody>
    </Card>
  );
}

function AttendanceReportBuilder() {
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: classes } = useQuery({ queryKey: ['classes', 'all'], queryFn: () => classesApi.list({ page: 1, limit: 100 }) });
  const { data: report, isFetching } = useQuery({
    queryKey: ['attendance-report', classId, month],
    queryFn: () => attendanceApi.report(classId, month),
    enabled: !!classId && !!month,
  });

  const classOptions = useMemo(() => (classes?.data ?? []).map((c) => ({ value: c.id, label: `${c.name} ${c.section}` })), [classes]);

  return (
    <Card>
      <CardHeader title="Attendance report" subtitle="Monthly attendance summary by class." />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Class" placeholder="Select class" options={classOptions} value={classId} onChange={(e) => setClassId(e.target.value)} />
          <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        {!classId ? (
          <EmptyState icon={<IconReports />} title="Select a class" description="Choose a class and month to generate the report." />
        ) : isFetching ? (
          <p className="py-8 text-center text-sm text-content-muted">Loading…</p>
        ) : report && report.perStudent.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryTile label="Present" value={report.totals.PRESENT} tone="success" />
              <SummaryTile label="Absent" value={report.totals.ABSENT} tone="danger" />
              <SummaryTile label="Late" value={report.totals.LATE} tone="warning" />
              <SummaryTile label="Excused" value={report.totals.EXCUSED} tone="info" />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
                    <th className="px-4 py-2 font-semibold">Student</th>
                    <th className="px-4 py-2 font-semibold">P</th>
                    <th className="px-4 py-2 font-semibold">A</th>
                    <th className="px-4 py-2 font-semibold">L</th>
                    <th className="px-4 py-2 font-semibold">E</th>
                    <th className="px-4 py-2 font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report.perStudent.map((s) => (
                    <tr key={s.studentId} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium text-content">{s.name}</td>
                      <td className="px-4 py-2">{s.present}</td>
                      <td className="px-4 py-2">{s.absent}</td>
                      <td className="px-4 py-2">{s.late}</td>
                      <td className="px-4 py-2">{s.excused}</td>
                      <td className="px-4 py-2"><StatusBadge tone={s.attendanceRate >= 75 ? 'success' : 'danger'}>{s.attendanceRate}%</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState icon={<IconReports />} title="No attendance data" description="No attendance was recorded for this class in the selected month." />
        )}
      </CardBody>
    </Card>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: 'success' | 'danger' | 'warning' | 'info' }) {
  const colors = { success: 'text-success-600', danger: 'text-danger-500', warning: 'text-amber-500', info: 'text-info-500' };
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className={`font-heading text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-content-muted">{label}</p>
    </div>
  );
}
