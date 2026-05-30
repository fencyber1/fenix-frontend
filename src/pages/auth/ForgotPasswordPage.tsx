import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { applyApiError } from '@/lib/formErrors';
import { forgotSchema, type ForgotValues } from '@/features/auth/auth.schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from './AuthShell';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (values: ForgotValues) => {
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      applyApiError(err, setError);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="If an account exists, a reset link is on its way.">
        <Link to="/login">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
        <Link to="/login" className="block text-center text-sm font-medium text-teal-600 hover:underline dark:text-teal-400">
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  );
}
