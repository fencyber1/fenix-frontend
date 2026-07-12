import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { staffApi, studentsApi } from '@/api/endpoints';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  displayId: string | null;
  status: string;
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers: UserRow[] = [];

      // Fetch staff (admins + teachers)
      if (!roleFilter || roleFilter === 'ADMIN' || roleFilter === 'TEACHER') {
        const staffRes = await staffApi.list({ limit: 100 });
        for (const s of staffRes.data) {
          if (!roleFilter || s.role === roleFilter) {
            allUsers.push({
              id: s.id,
              name: `${s.firstName} ${s.lastName}`,
              email: s.user?.email ?? '—',
              role: s.role,
              displayId: s.displayId ?? s.employeeNumber,
              status: s.user?.isVerified ? 'Active' : 'Pending',
              createdAt: s.joinDate,
            });
          }
        }
      }

      // Fetch students
      if (!roleFilter || roleFilter === 'STUDENT') {
        const studRes = await studentsApi.list({ limit: 100 });
        for (const s of studRes.data) {
          allUsers.push({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            email: '—',
            role: 'STUDENT',
            displayId: s.displayId ?? s.studentNumber,
            status: s.status,
            createdAt: s.createdAt,
          });
        }
      }

      setUsers(allUsers);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const ROLE_STYLES: Record<string, string> = {
    ADMIN: 'bg-teal-500/10 text-teal-600',
    TEACHER: 'bg-info-500/10 text-info-600',
    STUDENT: 'bg-purple-500/10 text-purple-600',
    PARENT: 'bg-amber-500/10 text-amber-600',
  };

  return (
    <>
      <PageHeader
        title="Users"
        description={`${users.length} users in this school`}
        actions={
          <a href="/admin/invite">
            <Button variant="primary" size="sm">+ Invite User</Button>
          </a>
        }
      />

      <div className="mb-4">
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'TEACHER', label: 'Teacher' },
            { value: 'STUDENT', label: 'Student' },
            { value: 'PARENT', label: 'Parent' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-40"
        />
      </div>

      <Card>
        <CardHeader title={`All Users (${users.length})`} />
        <CardBody>
          {loading ? (
            <p className="text-sm text-content-muted">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-content-muted">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs font-medium uppercase text-content-muted">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={u.name.split(' ')[0] ?? ''} lastName={u.name.split(' ').slice(1).join(' ')} size="sm" />
                          <div>
                            <p className="font-medium text-content">{u.name}</p>
                            <p className="text-xs text-content-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-content-muted">{u.displayId ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[u.role] ?? ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === 'Active' || u.status === 'ACTIVE' ? 'bg-success-500/10 text-success-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-content-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
