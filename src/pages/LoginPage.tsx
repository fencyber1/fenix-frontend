import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { applyApiError } from '@/lib/formErrors';
import { homeForRole } from '@/lib/roles';
import { loginSchema, type LoginValues } from '@/features/auth/auth.schemas';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Logo } from '@/components/layout/Logo';
import { IconStudents, IconGrades, IconStaff } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type RoleTab = 'TEACHER' | 'STUDENT' | 'PARENT';

const ROLES: { key: RoleTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'TEACHER', label: 'Teacher', icon: <IconStaff />, desc: 'Staff member' },
  { key: 'STUDENT', label: 'Student', icon: <IconStudents />, desc: 'Enrolled student' },
  { key: 'PARENT', label: 'Parent', icon: <IconGrades />, desc: 'Parent / Guardian' },
];

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleTab | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: undefined, schoolId: '', classId: '', studentId: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login({
        email: values.email,
        password: values.password,
        role: selectedRole ?? undefined,
        schoolId: values.schoolId || undefined,
        classId: values.classId || undefined,
        studentId: values.studentId || undefined,
      });
      toast.success('Welcome back');
      navigate(homeForRole(user.role), { replace: true });
    } catch (err) {
      applyApiError(err, setError);
    }
  };

  return (
    <div className="flex min-h-screen items-stretch bg-surface-2">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <Logo className="relative [&_span:last-child]:text-white" />
        <div className="relative max-w-md">
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Run your tenant with clarity.
          </h1>
          <p className="mt-4 text-navy-100">
            Students, attendance, grades, and fees — unified in one secure, real-time
            platform built for modern schools.
          </p>
        </div>
        <p className="relative text-sm text-navy-200">© {new Date().getFullYear()} FenDux SMS</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-heading text-2xl font-bold text-content">Sign in</h2>
          <p className="mt-1 text-sm text-content-muted">Select your role and enter your credentials.</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRole(r.key)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                  selectedRole === r.key
                    ? 'border-teal-500 bg-teal-500/8 shadow-sm'
                    : 'border-border bg-surface hover:border-teal-500/40 hover:bg-surface-2',
                )}
              >
                <span className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  selectedRole === r.key ? 'bg-teal-500/16 text-teal-600' : 'bg-surface-3 text-content-muted',
                )}>
                  {r.icon}
                </span>
                <span className="text-sm font-semibold text-content">{r.label}</span>
                <span className="text-[10px] text-content-subtle">{r.desc}</span>
              </button>
            ))}
          </div>

          {selectedRole && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
              {/* School ID — always shown */}
              <Input
                label="School ID"
                placeholder="e.g. SCH-001"
                error={errors.schoolId?.message}
                {...register('schoolId')}
              />

              {/* Class ID — student only */}
              {selectedRole === 'STUDENT' && (
                <Input
                  label="Class ID"
                  placeholder="e.g. CLS-001"
                  error={errors.classId?.message}
                  {...register('classId')}
                />
              )}

              {/* Student ID — parent only */}
              {selectedRole === 'PARENT' && (
                <Input
                  label="Student ID"
                  placeholder="e.g. STU-001"
                  error={errors.studentId?.message}
                  {...register('studentId')}
                />
              )}

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                error={errors.email?.message}
                {...register('email')}
              />
              <PasswordInput
                label="Password"
                autoComplete="current-password"
                placeholder="••••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Sign in as {ROLES.find((r) => r.key === selectedRole)?.label}
              </Button>
            </form>
          )}

          {!selectedRole && (
            <p className="mt-8 text-center text-sm text-content-muted">
              Choose your role above to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
