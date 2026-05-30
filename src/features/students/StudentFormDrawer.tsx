import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentsApi, classesApi } from '@/api/endpoints';
import { applyApiError } from '@/lib/formErrors';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { studentFormSchema, type StudentFormValues } from './students.schemas';
import type { Student } from '@/types/models';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];
const STATUSES = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'WITHDRAWN'].map((s) => ({
  value: s,
  label: s.charAt(0) + s.slice(1).toLowerCase(),
}));

export function StudentFormDrawer({
  open,
  onClose,
  student,
}: {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
}) {
  const qc = useQueryClient();
  const isEdit = !!student;

  const { data: classes } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classesApi.list({ page: 1, limit: 100 }),
    enabled: open && !isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { gender: 'MALE', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (!open) return;
    if (student) {
      reset({
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        dob: student.dob ?? '',
        gender: student.gender,
        admissionDate: student.admissionDate ?? '',
        status: student.status,
        bloodGroup: student.bloodGroup ?? '',
        address: student.address ?? '',
        medicalNotes: student.medicalNotes ?? '',
      });
    } else {
      reset({ gender: 'MALE', status: 'ACTIVE', studentNumber: '', firstName: '', lastName: '', dob: '', admissionDate: '' });
    }
  }, [open, student, reset]);

  const mutation = useMutation({
    mutationFn: (values: StudentFormValues) => {
      const payload: Record<string, unknown> = {
        studentNumber: values.studentNumber,
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        gender: values.gender,
        admissionDate: values.admissionDate,
        status: values.status,
        bloodGroup: values.bloodGroup || undefined,
        address: values.address || undefined,
        medicalNotes: values.medicalNotes || undefined,
      };
      if (!isEdit && values.classId) payload.classId = values.classId;
      return isEdit ? studentsApi.update(student.id, payload) : studentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Student updated' : 'Student created');
      qc.invalidateQueries({ queryKey: ['students'] });
      if (isEdit) qc.invalidateQueries({ queryKey: ['student', student.id] });
      onClose();
    },
    onError: (err) => applyApiError(err, setError),
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit student' : 'Add student'}
      width="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button form="student-form" type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create student'}
          </Button>
        </div>
      }
    >
      <form id="student-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Student number" error={errors.studentNumber?.message} {...register('studentNumber')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />
          <Select label="Gender" options={GENDERS} error={errors.gender?.message} {...register('gender')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Admission date" type="date" error={errors.admissionDate?.message} {...register('admissionDate')} />
          <Select label="Status" options={STATUSES} error={errors.status?.message} {...register('status')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Blood group" placeholder="O+" error={errors.bloodGroup?.message} {...register('bloodGroup')} />
          {!isEdit && (
            <Select
              label="Enroll in class (optional)"
              placeholder="No class"
              options={(classes?.data ?? []).map((c) => ({ value: c.id, label: `${c.name} ${c.section}` }))}
              error={errors.classId?.message}
              {...register('classId')}
            />
          )}
        </div>
        <Input label="Address" error={errors.address?.message} {...register('address')} />
        <Textarea label="Medical notes" rows={3} error={errors.medicalNotes?.message} {...register('medicalNotes')} />
      </form>
    </Drawer>
  );
}
