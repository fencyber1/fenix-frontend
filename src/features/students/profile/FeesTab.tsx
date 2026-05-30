import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/api/endpoints';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconFees } from '@/components/ui/icons';
import { formatDate, formatMoney } from '@/lib/utils';

export function FeesTab({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { studentId }],
    queryFn: () => feesApi.listInvoices({ studentId, limit: 60 }),
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
        <EmptyState icon={<IconFees />} title="No invoices" description="This student has no fee invoices yet." />
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-content-muted">
              <th className="px-5 py-3 font-semibold">Invoice</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Balance</th>
              <th className="px-5 py-3 font-semibold">Due</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0">
                <td className="px-5 py-2.5 font-mono text-xs">{inv.invoiceNumber}</td>
                <td className="px-5 py-2.5">{formatMoney(inv.amount)}</td>
                <td className="px-5 py-2.5">{formatMoney(inv.balance ?? 0)}</td>
                <td className="px-5 py-2.5">{formatDate(inv.dueDate)}</td>
                <td className="px-5 py-2.5"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
