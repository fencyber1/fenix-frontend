import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { invitationsApi } from '@/api/endpoints';

type FormState = 'idle' | 'submitting' | 'success';

const ROLE_OPTIONS = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
];

export function InviteUserPage() {
  const [role, setRole] = useState('TEACHER');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setError('');
    try {
      const roleData: Record<string, unknown> = {};
      if (role === 'TEACHER') {
        if (phone) roleData.phone = phone;
        if (location) roleData.location = location;
      }

      const result = await invitationsApi.invite({
        role,
        email,
        name,
        roleData: Object.keys(roleData).length > 0 ? roleData : undefined,
      });
      setInviteUrl(result.inviteUrl);
      setFormState('success');
      toast.success('Invitation created');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create invitation';
      setError(msg);
      setFormState('idle');
    }
  };

  const resetForm = () => {
    setRole('TEACHER');
    setEmail('');
    setName('');
    setPhone('');
    setLocation('');
    setFormState('idle');
    setInviteUrl('');
    setError('');
  };

  if (formState === 'success' && inviteUrl) {
    return (
      <>
        <PageHeader title="Invite User" description="Share this invitation link with the user." />
        <Card>
          <CardBody className="space-y-4">
            <div className="rounded-xl bg-teal-500/8 p-4">
              <p className="text-sm font-medium text-teal-700 dark:text-teal-300">Invitation link created!</p>
              <p className="mt-1 text-xs text-content-muted">This link expires in 7 days.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-content-muted">Invitation Link</label>
              <div className="mt-1 flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 rounded-xl border border-border bg-surface-3 px-3 py-2 text-sm text-content"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success('Copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <Button variant="ghost" onClick={resetForm}>Invite another user</Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Invite User" description="Send an invitation link to a new teacher, student, or parent." />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Smith"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />

            {role === 'TEACHER' && (
              <>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233..."
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                />
              </>
            )}

            {error && <p className="text-sm text-danger-500">{error}</p>}

            <Button type="submit" variant="primary" loading={formState === 'submitting'} disabled={formState === 'submitting'}>
              Send Invitation
            </Button>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
