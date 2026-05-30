import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/endpoints';
import { applyApiError } from '@/lib/formErrors';
import { resetSchema, type ResetValues } from '@/features/auth/auth.schemas';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { AuthShell } from './AuthShell';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (values: ResetValues) => {
    try {
      await authApi.resetPassword(token, values.password);
      toast.success('Password reset. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      applyApiError(err, setError);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This reset link is missing or malformed.">
        <Link to="/forgot-password">
          <Button variant="outline" className="w-full">
            Request a new link
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput label="New password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <PasswordInput label="Confirm password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
