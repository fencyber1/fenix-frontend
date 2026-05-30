import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi, schoolApi } from '@/api/endpoints';
import { usePermissions } from '@/hooks/usePermissions';
import { applyApiError } from '@/lib/formErrors';
import { changePasswordSchema, type ChangePasswordValues } from '@/features/auth/auth.schemas';
import type { NotificationChannel, NotificationType } from '@/types/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

const schoolSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(160),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Valid email').optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  timezone: z.string().trim().max(60),
  academicYearStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
});
type SchoolValues = z.infer<typeof schoolSchema>;

const NOTIF_TYPES: { type: NotificationType; label: string }[] = [
  { type: 'ATTENDANCE_ALERT', label: 'Attendance alerts' },
  { type: 'FEE_REMINDER', label: 'Fee reminders' },
  { type: 'REPORT_CARD', label: 'Report cards' },
  { type: 'GENERAL', label: 'General announcements' },
];
const CHANNELS: NotificationChannel[] = ['IN_APP', 'EMAIL', 'SMS'];

export function SettingsPage() {
  const { isAdmin } = usePermissions();

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your school profile, notifications and security." />
      {isAdmin && <SchoolProfileCard />}
      <NotificationPreferencesCard />
      <ChangePasswordCard />
    </div>
  );
}

function SchoolProfileCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['school'], queryFn: () => schoolApi.get() });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SchoolValues>({ resolver: zodResolver(schoolSchema) });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        timezone: data.timezone,
        academicYearStart: data.academicYearStart.slice(0, 10),
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: SchoolValues) => schoolApi.update({ ...values, phone: values.phone || null, email: values.email || null, address: values.address || null }),
    onSuccess: () => {
      toast.success('School profile updated');
      qc.invalidateQueries({ queryKey: ['school'] });
    },
    onError: (err) => applyApiError(err, setError),
  });

  return (
    <Card>
      <CardHeader title="School profile" subtitle="Basic information about your institution." />
      <CardBody>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
            <Input label="School name" error={errors.name?.message} {...register('name')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Address" error={errors.address?.message} {...register('address')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Academic year start" type="date" error={errors.academicYearStart?.message} {...register('academicYearStart')} />
              <Input label="Timezone" error={errors.timezone?.message} {...register('timezone')} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

function NotificationPreferencesCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notif-prefs'], queryFn: () => schoolApi.getPreferences() });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const t of NOTIF_TYPES) for (const c of CHANNELS) next[`${t.type}:${c}`] = true;
    for (const p of data ?? []) next[`${p.type}:${p.channel}`] = p.enabled;
    setPrefs(next);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      const preferences = Object.entries(prefs).map(([key, enabled]) => {
        const [type, channel] = key.split(':');
        return { type: type as string, channel: channel as string, enabled };
      });
      return schoolApi.setPreferences(preferences);
    },
    onSuccess: () => {
      toast.success('Notification preferences saved');
      qc.invalidateQueries({ queryKey: ['notif-prefs'] });
    },
    onError: () => toast.error('Could not save preferences'),
  });

  return (
    <Card>
      <CardHeader title="Notification preferences" subtitle="Choose how you receive each type of alert." />
      <CardBody>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-content-muted">
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    {CHANNELS.map((c) => (
                      <th key={c} className="px-3 py-2 text-center font-semibold">{c.replace('_', '-')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NOTIF_TYPES.map((t) => (
                    <tr key={t.type} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-content">{t.label}</td>
                      {CHANNELS.map((c) => {
                        const key = `${t.type}:${c}`;
                        return (
                          <td key={c} className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={prefs[key] ?? true}
                              onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                              className="h-4 w-4 accent-teal-500"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save preferences</Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const mutation = useMutation({
    mutationFn: (v: ChangePasswordValues) => authApi.changePassword(v.currentPassword, v.newPassword),
    onSuccess: () => {
      toast.success('Password changed. Use it next time you sign in.');
      reset({ currentPassword: '', newPassword: '', confirm: '' });
    },
    onError: (err) => applyApiError(err, setError),
  });

  return (
    <Card>
      <CardHeader title="Security" subtitle="Change your account password." />
      <CardBody>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="max-w-md space-y-4" noValidate>
          <PasswordInput label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
          <PasswordInput label="New password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordInput label="Confirm new password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>Change password</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
