import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { studentsApi, type StudentListParams } from '@/api/endpoints';
import type { Student } from '@/types/models';
import { useDebounced } from '@/hooks/useDebounced';
import { usePermissions } from '@/hooks/usePermissions';
import { errorMessage } from '@/lib/formErrors';
import { formatDate, fullName } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconPlus, IconSearch, IconStudents, IconTrash, IconUpload, IconEdit } from '@/components/ui/icons';
import { StudentFormDrawer } from '@/features/students/StudentFormDrawer';
import { ImportStudentsModal } from '@/features/students/ImportStudentsModal';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export function StudentsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canManageStudents, canEditStudents } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const debouncedSearch = useDebounced(search, 350);

  const params: StudentListParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: status || undefined,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }),
    [page, debouncedSearch, status, sorting],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.list(params),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => {
      toast.success('Student deleted');
      qc.invalidateQueries({ queryKey: ['students'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns = useMemo<ColumnDef<Student, unknown>[]>(
    () => [
      {
        id: 'lastName',
        header: 'Student',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
              <div>
                <p className="font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                <p className="text-xs text-content-subtle">{s.studentNumber}</p>
              </div>
            </div>
          );
        },
      },
      { id: 'gender', header: 'Gender', enableSorting: false, cell: ({ row }) => <span className="capitalize">{row.original.gender.toLowerCase()}</span> },
      { id: 'admissionDate', header: 'Admitted', cell: ({ row }) => formatDate(row.original.admissionDate) },
      { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {canEditStudents && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit"
                onClick={() => {
                  setEditing(row.original);
                  setDrawerOpen(true);
                }}
              >
                <IconEdit />
              </Button>
            )}
            {canManageStudents && (
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleting(row.original)}>
                <span className="text-danger-500">
                  <IconTrash />
                </span>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canEditStudents, canManageStudents],
  );

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records, enrollment and profiles."
        actions={
          canManageStudents && (
            <>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <IconUpload /> Import CSV
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
              >
                <IconPlus /> Add student
              </Button>
            </>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            placeholder="Search by name or number…"
            leftIcon={<IconSearch />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="sm:w-48">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
        onPageChange={setPage}
        onRowClick={(s) => navigate(`/students/${s.id}`)}
        emptyState={
          <EmptyState
            icon={<IconStudents />}
            title={search || status ? 'No matching students' : 'No students yet'}
            description={
              search || status
                ? 'Try adjusting your search or filters.'
                : 'Add your first student or import a roster to get started.'
            }
            action={
              canManageStudents && !search && !status ? (
                <Button onClick={() => setDrawerOpen(true)}>
                  <IconPlus /> Add student
                </Button>
              ) : undefined
            }
          />
        }
      />

      <StudentFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} student={editing} />
      <ImportStudentsModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete student"
        description={
          <>
            This will deactivate <strong>{deleting && fullName(deleting.firstName, deleting.lastName)}</strong>. The record
            is soft-deleted and can be restored by an administrator.
          </>
        }
        confirmLabel="Delete student"
        confirmPhrase="DELETE"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
