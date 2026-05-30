import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { feesApi } from '@/api/endpoints';
import type { FeeInvoice } from '@/types/models';
import { usePermissions } from '@/hooks/usePermissions';
import { applyApiError, errorMessage } from '@/lib/formErrors';
import { formatDate, formatMoney, fullName } from '@/lib/utils';
import { generateInvoicePdf } from '@/features/pdf/generate';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconDownload, IconFees } from '@/components/ui/icons';
import { useAuthStore } from '@/stores/authStore';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'WAIVED', label: 'Waived' },
];
const METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'CHEQUE', label: 'Cheque' },
];

const paymentSchema = z.object({
  amountPaid: z.coerce.number().positive('Enter a positive amount'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE']),
  reference: z.string().trim().max(120).optional().or(z.literal('')),
});
type PaymentValues = z.infer<typeof paymentSchema>;

export function FeesPage() {
  const qc = useQueryClient();
  const { canManageFees } = usePermissions();
  const schoolName = useAuthStore((s) => s.user?.email ?? 'School');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [payInvoice, setPayInvoice] = useState<FeeInvoice | null>(null);
  const [waiveInvoice, setWaiveInvoice] = useState<FeeInvoice | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { page, status }],
    queryFn: () => feesApi.listInvoices({ page, limit: 20, status: status || undefined }),
    placeholderData: keepPreviousData,
  });
  const { data: summary } = useQuery({ queryKey: ['fee-summary'], queryFn: () => feesApi.summary({}) });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PaymentValues>({ resolver: zodResolver(paymentSchema) });

  const openPay = (inv: FeeInvoice) => {
    setPayInvoice(inv);
    reset({ amountPaid: inv.balance ?? Number(inv.amount) - Number(inv.amountPaid), paymentDate: new Date().toISOString().slice(0, 10), method: 'CASH', reference: '' });
  };

  const payMutation = useMutation({
    mutationFn: (values: PaymentValues) =>
      feesApi.recordPayment({ invoiceId: payInvoice!.id, amountPaid: values.amountPaid, paymentDate: values.paymentDate, method: values.method, reference: values.reference || undefined }),
    onSuccess: () => {
      toast.success('Payment recorded');
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['fee-summary'] });
      setPayInvoice(null);
    },
    onError: (err) => applyApiError(err, setError),
  });

  const waiveMutation = useMutation({
    mutationFn: (id: string) => feesApi.waiveInvoice(id, 'Waived by administrator'),
    onSuccess: () => {
      toast.success('Invoice waived');
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['fee-summary'] });
      setWaiveInvoice(null);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const handleDownload = async (inv: FeeInvoice) => {
    try {
      const full = await feesApi.getInvoice(inv.id);
      await generateInvoicePdf(full, schoolName);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns = useMemo<ColumnDef<FeeInvoice, unknown>[]>(
    () => [
      { id: 'invoiceNumber', header: 'Invoice', enableSorting: false, cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span> },
      {
        id: 'student',
        header: 'Student',
        enableSorting: false,
        cell: ({ row }) => (row.original.student ? fullName(row.original.student.firstName, row.original.student.lastName) : '—'),
      },
      { id: 'amount', header: 'Amount', enableSorting: false, cell: ({ row }) => formatMoney(row.original.amount) },
      { id: 'balance', header: 'Balance', enableSorting: false, cell: ({ row }) => formatMoney(row.original.balance ?? 0) },
      { id: 'dueDate', header: 'Due', enableSorting: false, cell: ({ row }) => formatDate(row.original.dueDate) },
      { id: 'status', header: 'Status', enableSorting: false, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const inv = row.original;
          const settled = inv.status === 'PAID' || inv.status === 'WAIVED';
          return (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" aria-label="Download" onClick={() => handleDownload(inv)}>
                <IconDownload />
              </Button>
              {canManageFees && !settled && (
                <>
                  <Button variant="outline" size="sm" onClick={() => openPay(inv)}>
                    Pay
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setWaiveInvoice(inv)}>
                    Waive
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManageFees],
  );

  return (
    <div>
      <PageHeader title="Fees" description="Track invoices, record payments and manage balances." />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total billed" value={formatMoney(summary?.totalBilled ?? 0)} tone="navy" icon={<IconFees />} loading={!summary} />
        <StatCard label="Collected" value={formatMoney(summary?.totalCollected ?? 0)} tone="teal" icon={<IconFees />} loading={!summary} />
        <StatCard label="Outstanding" value={formatMoney(summary?.totalOutstanding ?? 0)} tone="amber" icon={<IconFees />} loading={!summary} />
        <StatCard label="Waived" value={formatMoney(summary?.totalWaived ?? 0)} tone="navy" icon={<IconFees />} loading={!summary} />
      </div>

      <div className="mb-4 sm:w-48">
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        onPageChange={setPage}
        emptyState={<EmptyState icon={<IconFees />} title="No invoices found" description="Invoices will appear here once issued to students." />}
      />

      <Modal open={!!payInvoice} onClose={() => setPayInvoice(null)} title="Record payment" size="sm">
        {payInvoice && (
          <form onSubmit={handleSubmit((v) => payMutation.mutate(v))} className="space-y-4" noValidate>
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              <div className="flex justify-between"><span className="text-content-muted">Invoice</span><span className="font-mono">{payInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-content-muted">Balance</span><span className="font-semibold">{formatMoney(payInvoice.balance ?? 0)}</span></div>
            </div>
            <Input label="Amount" type="number" step="0.01" error={errors.amountPaid?.message} {...register('amountPaid')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Payment date" type="date" error={errors.paymentDate?.message} {...register('paymentDate')} />
              <Select label="Method" options={METHODS} error={errors.method?.message} {...register('method')} />
            </div>
            <Input label="Reference (optional)" error={errors.reference?.message} {...register('reference')} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setPayInvoice(null)}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Record payment</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!waiveInvoice}
        onClose={() => setWaiveInvoice(null)}
        onConfirm={() => waiveInvoice && waiveMutation.mutate(waiveInvoice.id)}
        title="Waive invoice"
        description={<>Waiving <strong>{waiveInvoice?.invoiceNumber}</strong> clears its outstanding balance. This action is audited and cannot be reversed by recording a payment.</>}
        confirmLabel="Waive invoice"
        confirmPhrase="WAIVE"
        loading={waiveMutation.isPending}
      />
    </div>
  );
}
