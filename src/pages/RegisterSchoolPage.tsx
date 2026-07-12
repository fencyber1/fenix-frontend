import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { registerSchema, type RegisterValues } from '@/features/auth/auth.schemas';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Logo } from '@/components/layout/Logo';

export function RegisterSchoolPage() {
  const registerSchool = useAuthStore((s) => s.registerSchool);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerSchool({
        schoolName: values.schoolName,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success('School registered! Check your email to verify.');
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError('root', { message: msg });
    }
  };

  return (
    <div className="flex min-h-screen items-stretch bg-surface-2">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <Logo className="relative [&_span:last-child]:text-white" />
        <div className="relative max-w-md">
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Start managing your school today.
          </h1>
          <p className="mt-4 text-navy-100">
            Create your school account and get started in minutes. Students, attendance, grades, and fees — all in one place.
          </p>
        </div>
        <p className="relative text-sm text-navy-200">© {new Date().getFullYear()} FenDux SMS</p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-heading text-2xl font-bold text-content">Create your school</h2>
          <p className="mt-1 text-sm text-content-muted">Set up your school in under a minute.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <Input
              label="School name"
              placeholder="e.g. FenDux Academy"
              error={errors.schoolName?.message}
              {...register('schoolName')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="admin@school.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              placeholder="••••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              placeholder="••••••••••"
              error={errors.confirm?.message}
              {...register('confirm')}
            />

            {errors.root && (
              <p className="text-sm text-danger-500">{errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create School
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-content-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:underline dark:text-teal-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
