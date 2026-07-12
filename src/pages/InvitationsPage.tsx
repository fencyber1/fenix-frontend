import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { invitationsApi } from '@/api/endpoints';

interface Invitation {
  id: string;
  role: string;
  email: string;
  name: string;
  status: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600',
  USED: 'bg-success-500/10 text-success-600',
  EXPIRED: 'bg-content-subtle/10 text-content-muted',
  REVOKED: 'bg-danger-500/10 text-danger-500',
};

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    invitationsApi.list({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      limit: 50,
    }).then((res) => {
      setInvitations(res.data as Invitation[]);
      setTotal(res.meta.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await invitationsApi.revoke(revokeTarget.id);
      setInvitations((prev) => prev.map((i) => i.id === revokeTarget.id ? { ...i, status: 'REVOKED' } : i));
      setRevokeTarget(null);
      toast.success('Invitation revoked');
    } catch {
      toast.error('Failed to revoke invitation');
    } finally {
      setRevoking(false);
    }
  };

  const copyLink = (_invitation: Invitation) => {
    // We can't recover the raw token, so we show a message
    toast.info('Only newly created invitations can be copied. Use "Invite User" to create a new link.');
  };

  return (
    <>
      <PageHeader
        title="Invitations"
        description={`${total} total invitations`}
        actions={
          <a href="/admin/invite">
            <Button variant="primary" size="sm">+ Invite User</Button>
          </a>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'TEACHER', label: 'Teacher' },
            { value: 'STUDENT', label: 'Student' },
            { value: 'PARENT', label: 'Parent' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'USED', label: 'Used' },
            { value: 'EXPIRED', label: 'Expired' },
            { value: 'REVOKED', label: 'Revoked' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      <Card>
        <CardHeader title={`Invitations (${invitations.length})`} />
        <CardBody>
          {loading ? (
            <p className="text-sm text-content-muted">Loading...</p>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-content-muted">No invitations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs font-medium uppercase text-content-muted">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Expires</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
                      <td className="px-3 py-2 font-medium text-content">{inv.name}</td>
                      <td className="px-3 py-2 text-content-muted">{inv.email}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-navy-800/10 px-2 py-0.5 text-xs font-medium text-navy-700 dark:bg-white/10 dark:text-white">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status] ?? ''}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-content-muted">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-content-muted">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-right">
                        {inv.status === 'PENDING' && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => copyLink(inv)}>Copy</Button>
                            <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(inv)} className="text-danger-500 hover:bg-danger-500/10">
                              Revoke
                            </Button>
                          </div>
                        )}
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
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title={`Revoke invitation for "${revokeTarget?.email ?? ''}"`}
        description="This will invalidate the invitation link. The user will not be able to register with it."
        confirmLabel="Revoke"
        loading={revoking}
      />
    </>
  );
}
