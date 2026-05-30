import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classesApi, staffApi } from '@/api/endpoints';
import type { SchoolClass } from '@/types/models';
import { usePermissions } from '@/hooks/usePermissions';
import { applyApiError, errorMessage } from '@/lib/formErrors';
import { currentYear, fullName } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconClasses, IconPlus, IconTrash, IconEdit } from '@/components/ui/icons';

const classSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(80),
  section: z.string().trim().min(1, 'Required').max(40),
  academicYear: z.string().trim().min(1, 'Required').max(20),
  classTeacherId: z.string().optional().or(z.literal('')),
  capacity: z.coerce.number().int().min(1).max(500),
});
type ClassValues = z.infer<typeof classSchema>;

export function ClassesPage() {
  const qc = useQueryClient();
  const { canManageClasses } = usePermissions();
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [rosterClass, setRosterClass] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState<SchoolClass | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', { page }],
    queryFn: () => classesApi.list({ page, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const { data: staff } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffApi.list({ page: 1, limit: 100 }),
    enabled: canManageClasses,
  });

  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ['roster', rosterClass?.id],
    queryFn: () => classesApi.roster(rosterClass!.id),
    enabled: !!rosterClass,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClassValues>({ resolver: zodResolver(classSchema), defaultValues: { capacity: 40, academicYear: currentYear() } });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', section: '', academicYear: currentYear(), classTeacherId: '', capacity: 40 });
    setDrawerOpen(true);
  };
  const openEdit = (c: SchoolClass) => {
    setEditing(c);
    reset({ name: c.name, section: c.section, academicYear: c.academicYear, classTeacherId: c.classTeacherId ?? '', capacity: c.capacity });
    setDrawerOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: ClassValues) => {
      const payload = { ...values, classTeacherId: values.classTeacherId || undefined };
      return editing ? classesApi.update(editing.id, payload) : classesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Class updated' : 'Class created');
      qc.invalidateQueries({ queryKey: ['classes'] });
      setDrawerOpen(false);
    },
    onError: (err) => applyApiError(err, setError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classesApi.remove(id),
    onSuccess: () => {
      toast.success('Class deleted');
      qc.invalidateQueries({ queryKey: ['classes'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const teacherOptions = useMemo(
    () => (staff?.data ?? []).map((s) => ({ value: s.id, label: fullName(s.firstName, s.lastName) })),
    [staff],
  );

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Organize classes and sections, assign teachers, and view rosters."
        actions={
          canManageClasses && (
            <Button onClick={openCreate}>
              <IconPlus /> Add class
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (data?.data.length ?? 0) === 0 ? (
        <Card>
          <EmptyState
            icon={<IconClasses />}
            title="No classes yet"
            description="Create your first class to start enrolling students."
            action={canManageClasses ? <Button onClick={openCreate}><IconPlus /> Add class</Button> : undefined}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((c) => (
              <Card key={c.id} className="transition-shadow hover:shadow-card-hover">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-content">
                        {c.name} {c.section}
                      </h3>
                      <p className="text-sm text-content-muted">Year {c.academicYear}</p>
                    </div>
                    {canManageClasses && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(c)}>
                          <IconEdit />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleting(c)}>
                          <span className="text-danger-500"><IconTrash /></span>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-content-muted">
                    <span>{c._count?.enrollments ?? 0}/{c.capacity} students</span>
                    <span>{c._count?.subjects ?? 0} subjects</span>
                  </div>
                  <p className="mt-2 text-sm text-content-muted">
                    Teacher: {c.classTeacher ? fullName(c.classTeacher.firstName, c.classTeacher.lastName) : '—'}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setRosterClass(c)}>
                    View roster
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-xs text-content-muted">Page {data.meta.page} of {data.meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit class' : 'Add class'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button form="class-form" type="submit" loading={isSubmitting}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        }
      >
        <form id="class-form" onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4" noValidate>
          <Input label="Class name" placeholder="Grade 5" error={errors.name?.message} {...register('name')} />
          <Input label="Section" placeholder="A" error={errors.section?.message} {...register('section')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Academic year" error={errors.academicYear?.message} {...register('academicYear')} />
            <Input label="Capacity" type="number" error={errors.capacity?.message} {...register('capacity')} />
          </div>
          <Select label="Class teacher (optional)" placeholder="Unassigned" options={teacherOptions} error={errors.classTeacherId?.message} {...register('classTeacherId')} />
        </form>
      </Drawer>

      <Modal open={!!rosterClass} onClose={() => setRosterClass(null)} title={rosterClass ? `${rosterClass.name} ${rosterClass.section} — Roster` : ''} size="md">
        {rosterLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (roster?.length ?? 0) === 0 ? (
          <EmptyState title="No students enrolled" description="Enroll students to populate this roster." />
        ) : (
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {roster?.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2">
                <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
                <div>
                  <p className="text-sm font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                  <p className="text-xs text-content-subtle">{s.studentNumber}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete class"
        description={<>This soft-deletes <strong>{deleting?.name} {deleting?.section}</strong>. Enrollments are retained.</>}
        confirmLabel="Delete class"
        confirmPhrase="DELETE"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
