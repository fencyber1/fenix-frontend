import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { invitationsApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

type TokenState = 'loading' | 'valid' | 'invalid';
type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [tokenState, setTokenState] = useState<TokenState>('loading');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [roleData, setRoleData] = useState<Record<string, unknown>>({});

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState('');
  const [displayId, setDisplayId] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    invitationsApi.validate(token)
      .then((data) => {
        if (data.valid) {
          setTokenState('valid');
          setRole(data.role ?? '');
          setEmail(data.email ?? '');
          setName(data.name ?? '');
          setSchoolName(data.schoolName ?? '');
          setRoleData(data.roleData ?? {});
        } else {
          setTokenState('invalid');
        }
      })
      .catch(() => setTokenState('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) return;

    setFormState('submitting');
    setError('');
    try {
      const result = await invitationsApi.register({
        token,
        password,
        phone: phone || undefined,
        location: location || undefined,
      });
      setDisplayId(result.displayId);
      setFormState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      setFormState('error');
    }
  };

  if (!token || tokenState === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
        <Card className="w-full max-w-md">
          <CardBody className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-500/10">
              <svg className="h-8 w-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-content">Invalid Link</h2>
            <p className="text-sm text-content-muted">
              This invitation link is invalid or has expired. Please contact your school administrator for a new link.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">Go to Login</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (tokenState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <div className="text-sm text-content-muted">Validating invitation...</div>
      </div>
    );
  }

  if (formState === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
        <Card className="w-full max-w-md">
          <CardBody className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
              <svg className="h-8 w-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-content">Registration Complete!</h2>
            <p className="text-sm text-content-muted">
              Your account has been created successfully.
            </p>
            <div className="rounded-xl bg-surface-3 px-4 py-3">
              <p className="text-xs text-content-muted">Your {role === 'TEACHER' ? 'Teacher' : role === 'STUDENT' ? 'Student' : ''} ID</p>
              <p className="font-heading text-lg font-bold text-teal-600">{displayId}</p>
            </div>
            <p className="text-xs text-content-muted">
              Save this ID — you'll need it to log in.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">Go to Login</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-content">Complete Registration</h1>
              <p className="mt-1 text-sm text-content-muted">{schoolName}</p>
            </div>

            {/* Pre-filled info */}
            <div className="space-y-3 rounded-xl bg-surface-3 p-4">
              <div>
                <label className="text-xs font-medium text-content-muted">Email</label>
                <p className="text-sm font-medium text-content">{email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-content-muted">Name</label>
                <p className="text-sm font-medium text-content">{name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-content-muted">Role</label>
                <p className="text-sm font-medium text-content capitalize">{role.toLowerCase()}</p>
              </div>
              {role === 'STUDENT' && typeof roleData.classId === 'string' && (
                <div>
                  <label className="text-xs font-medium text-content-muted">Class ID</label>
                  <p className="text-sm font-medium text-content">{roleData.classId}</p>
                </div>
              )}
              {role === 'PARENT' && typeof roleData.studentId === 'string' && (
                <div>
                  <label className="text-xs font-medium text-content-muted">Student ID</label>
                  <p className="text-sm font-medium text-content">{roleData.studentId}</p>
                </div>
              )}
            </div>

            {/* Role-specific fields */}
            {role === 'TEACHER' && (
              <>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233..."
                  required
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                  required
                />
              </>
            )}

            {role === 'STUDENT' && (
              <Input
                label="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
              />
            )}

            {role === 'PARENT' && (
              <Input
                label="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233..."
              />
            )}

            {/* Password */}
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
            />
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-danger-500">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={formState === 'submitting'}
              disabled={formState === 'submitting'}
            >
              Complete Registration
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
