import { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { auditApi } from '@/api/endpoints';
import type { AuditLog } from '@/types/models';
import { formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { IconAudit } from '@/components/ui/icons';

const TABLE_OPTIONS = [
  { value: '', label: 'All tables' },
  { value: 'students', label: 'Students' },
  { value: 'fee_invoices', label: 'Fee invoices' },
  { value: 'grades', label: 'Grades' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'classes', label: 'Classes' },
  { value: 'staff', label: 'Staff' },
  { value: 'users', label: 'Users' },
];

const ACTION_TONE: Record<string, 'success' | 'info' | 'danger' | 'warning' | 'neutral' | 'teal'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  PAYMENT: 'teal',
  WAIVE: 'warning',
  LOGIN: 'neutral',
  LOGOUT: 'neutral',
};

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [table, setTable] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', { page, table, from, to }],
    queryFn: () => auditApi.list({ page, limit: 25, table: table || undefined, from: from || undefined, to: to || undefined }),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      { id: 'createdAt', header: 'When', enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-xs">{formatDateTime(row.original.createdAt)}</span> },
      { id: 'actor', header: 'Actor', enableSorting: false, cell: ({ row }) => row.original.actor?.email ?? 'System' },
      { id: 'action', header: 'Action', enableSorting: false, cell: ({ row }) => <StatusBadge tone={ACTION_TONE[row.original.action] ?? 'neutral'}>{row.original.action}</StatusBadge> },
      { id: 'table', header: 'Table', enableSorting: false, cell: ({ row }) => <span className="font-mono text-xs">{row.original.tableName}</span> },
      { id: 'record', header: 'Record', enableSorting: false, cell: ({ row }) => <span className="font-mono text-xs text-content-subtle">{row.original.recordId.slice(0, 8)}…</span> },
      { id: 'ip', header: 'IP', enableSorting: false, cell: ({ row }) => <span className="text-xs">{row.original.ipAddress ?? '—'}</span> },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Audit Log" description="Every create, update and delete is recorded with actor and timestamp." />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Select options={TABLE_OPTIONS} value={table} onChange={(e) => { setTable(e.target.value); setPage(1); }} />
        <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label="From date" />
        <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} aria-label="To date" />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        onPageChange={setPage}
        onRowClick={(row) => setDetail(row)}
        emptyState={<EmptyState icon={<IconAudit />} title="No audit entries" description="Activity will be recorded here as users make changes." />}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Audit entry" size="lg">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-content-muted">Actor</p><p>{detail.actor?.email ?? 'System'}</p></div>
              <div><p className="text-content-muted">When</p><p>{formatDateTime(detail.createdAt)}</p></div>
              <div><p className="text-content-muted">Action</p><p>{detail.action}</p></div>
              <div><p className="text-content-muted">Table</p><p className="font-mono text-xs">{detail.tableName}</p></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-content-muted">Before</p>
                <pre className="max-h-60 overflow-auto rounded-xl bg-surface-2 p-3 text-[11px]">{JSON.stringify(detail.beforeJson ?? null, null, 2)}</pre>
              </div>
              <div>
                <p className="mb-1 text-content-muted">After</p>
                <pre className="max-h-60 overflow-auto rounded-xl bg-surface-2 p-3 text-[11px]">{JSON.stringify(detail.afterJson ?? null, null, 2)}</pre>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
