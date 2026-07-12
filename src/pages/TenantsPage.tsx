import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { IconTrash } from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { tenantApi } from '@/api/endpoints';

interface TenantRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subscriptionTier: string;
  createdAt: string;
  _count: { students: number; staff: number; classes: number; users: number };
}

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TenantRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    tenantApi.list().then((data) => setTenants(data as unknown as TenantRow[])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tenantApi.remove(deleteTarget.id);
      setTenants((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Schools / Tenants" description="Manage all registered schools on the platform." />

      <Card>
        <CardHeader title={`All Schools (${tenants.length})`} />
        <CardBody>
          {loading ? (
            <p className="text-sm text-content-muted">Loading...</p>
          ) : tenants.length === 0 ? (
            <p className="text-sm text-content-muted">No schools found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs font-medium uppercase text-content-muted">
                    <th className="px-3 py-2">School Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Users</th>
                    <th className="px-3 py-2">Students</th>
                    <th className="px-3 py-2">Staff</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
                      <td className="px-3 py-2 font-medium text-content">{t.name}</td>
                      <td className="px-3 py-2 text-content-muted">{t.email ?? '—'}</td>
                      <td className="px-3 py-2 text-content-muted">{t.phone ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-600">
                          {t.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-content-muted">{t._count.users}</td>
                      <td className="px-3 py-2 text-content-muted">{t._count.students}</td>
                      <td className="px-3 py-2 text-content-muted">{t._count.staff}</td>
                      <td className="px-3 py-2 text-content-muted">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(t)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name ?? ''}"`}
        description={
          <span>
            This will soft-delete the school <strong>{deleteTarget?.name}</strong> and deactivate all its users.
            This action can be reversed by a database administrator.
          </span>
        }
        confirmLabel="Delete School"
        loading={deleting}
      />
    </>
  );
}
