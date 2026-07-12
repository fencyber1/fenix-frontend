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

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values.email, values.password);
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
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-heading text-2xl font-bold text-content">Sign in</h2>
          <p className="mt-1 text-sm text-content-muted">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@tenant.edu"
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
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
