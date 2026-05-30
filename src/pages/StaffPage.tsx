import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { staffApi } from '@/api/endpoints';
import type { Staff } from '@/types/models';
import { useDebounced } from '@/hooks/useDebounced';
import { applyApiError, errorMessage } from '@/lib/formErrors';
import { fullName } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Drawer } from '@/components/ui/Drawer';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconPlus, IconSearch, IconStaff, IconTrash } from '@/components/ui/icons';

const staffSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email required'),
  employeeNumber: z.string().trim().min(1, 'Required').max(40),
  firstName: z.string().trim().min(1, 'Required').max(80),
  lastName: z.string().trim().min(1, 'Required').max(80),
  role: z.string().trim().min(1, 'Required').max(60),
  systemRole: z.enum(['ADMIN', 'TEACHER']),
  department: z.string().trim().max(80).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required'),
});
type StaffValues = z.infer<typeof staffSchema>;

const SYSTEM_ROLES = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'ADMIN', label: 'Administrator' },
];

export function StaffPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState<Staff | null>(null);
  const debouncedSearch = useDebounced(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['staff', { page, search: debouncedSearch }],
    queryFn: () => staffApi.list({ page, limit: 20, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffValues>({ resolver: zodResolver(staffSchema), defaultValues: { systemRole: 'TEACHER' } });

  const openCreate = () => {
    reset({ systemRole: 'TEACHER', role: 'Teacher', email: '', employeeNumber: '', firstName: '', lastName: '', department: '', phone: '', joinDate: new Date().toISOString().slice(0, 10) });
    setDrawerOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: StaffValues) =>
      staffApi.create({ ...values, department: values.department || undefined, phone: values.phone || undefined }),
    onSuccess: () => {
      toast.success('Staff created and invited by email');
      qc.invalidateQueries({ queryKey: ['staff'] });
      setDrawerOpen(false);
    },
    onError: (err) => applyApiError(err, setError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => {
      toast.success('Staff removed');
      qc.invalidateQueries({ queryKey: ['staff'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns = useMemo<ColumnDef<Staff, unknown>[]>(
    () => [
      {
        id: 'lastName',
        header: 'Staff',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
              <div>
                <p className="font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                <p className="text-xs text-content-subtle">{s.user?.email}</p>
              </div>
            </div>
          );
        },
      },
      { id: 'employeeNumber', header: 'Emp. No', cell: ({ row }) => row.original.employeeNumber },
      { id: 'role', header: 'Role', cell: ({ row }) => row.original.role },
      { id: 'department', header: 'Department', enableSorting: false, cell: ({ row }) => row.original.department ?? '—' },
      {
        id: 'verified',
        header: 'Account',
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.user?.isVerified ? 'VERIFIED' : 'UNVERIFIED'} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setDeleting(row.original)}>
              <span className="text-danger-500"><IconTrash /></span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage teachers and administrators."
        actions={
          <Button onClick={openCreate}>
            <IconPlus /> Add staff
          </Button>
        }
      />

      <div className="mb-4 sm:max-w-xs">
        <Input placeholder="Search staff…" leftIcon={<IconSearch />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<IconStaff />}
            title="No staff yet"
            description="Add teachers and administrators; they'll receive an email invitation."
            action={<Button onClick={openCreate}><IconPlus /> Add staff</Button>}
          />
        }
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add staff member"
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button form="staff-form" type="submit" loading={isSubmitting}>Create & invite</Button>
          </div>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee number" error={errors.employeeNumber?.message} {...register('employeeNumber')} />
            <Input label="Join date" type="date" error={errors.joinDate?.message} {...register('joinDate')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job title" placeholder="Mathematics Teacher" error={errors.role?.message} {...register('role')} />
            <Select label="System role" options={SYSTEM_ROLES} error={errors.systemRole?.message} {...register('systemRole')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Department (optional)" error={errors.department?.message} {...register('department')} />
            <Input label="Phone (optional)" error={errors.phone?.message} {...register('phone')} />
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Remove staff member"
        description={<>This deactivates <strong>{deleting && fullName(deleting.firstName, deleting.lastName)}</strong> and disables their account.</>}
        confirmLabel="Remove staff"
        confirmPhrase="REMOVE"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
