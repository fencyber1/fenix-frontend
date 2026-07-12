import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { errorMessage } from '@/lib/formErrors';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AuthShell } from './AuthShell';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Verification link is missing a token.');
      return;
    }
    const controller = new AbortController();
    authApi
      .verifyEmail(token)
      .then(() => { if (!controller.signal.aborted) setState('success'); })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setState('error');
          setMessage(errorMessage(err));
        }
      });
    return () => controller.abort();
  }, [token]);

  return (
    <AuthShell
      title={state === 'success' ? 'Email verified' : state === 'error' ? 'Verification failed' : 'Verifying…'}
      subtitle={state === 'success' ? 'Your account is ready. You can sign in now.' : state === 'error' ? message : undefined}
    >
      {state === 'loading' && (
        <div className="flex justify-center py-4">
          <Spinner className="h-7 w-7" />
        </div>
      )}
      {state !== 'loading' && (
        <Link to="/login">
          <Button className="w-full" variant={state === 'success' ? 'primary' : 'outline'}>
            Go to sign in
          </Button>
        </Link>
      )}
    </AuthShell>
  );
}
