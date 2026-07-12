import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconClasses, IconStudents, IconPlus } from '@/components/ui/icons';
import { classesApi, subjectsApi } from '@/api/endpoints';
import { usePermissions } from '@/hooks/usePermissions';
import { fullName } from '@/lib/utils';
import type { SchoolClass, Subject, Student } from '@/types/models';

const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const subjectSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(80),
  code: z.string().trim().min(1, 'Required').max(20),
  description: z.string().trim().max(500).optional(),
});
type SubjectValues = z.infer<typeof subjectSchema>;

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canManageClasses } = usePermissions();
  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [roster, setRoster] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [subjectDrawerOpen, setSubjectDrawerOpen] = useState(false);

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInvite,
    formState: { errors: inviteErrors, isSubmitting: inviteSubmitting },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema) });

  const {
    register: registerSubject,
    handleSubmit: handleSubjectSubmit,
    reset: resetSubject,
    formState: { errors: subjectErrors, isSubmitting: subjectSubmitting },
  } = useForm<SubjectValues>({ resolver: zodResolver(subjectSchema) });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const controller = new AbortController();
    Promise.all([
      classesApi.get(id),
      classesApi.roster(id),
      subjectsApi.list({ classId: id }),
    ]).then(([c, r, s]) => {
      if (!controller.signal.aborted) {
        setClassData(c);
        setRoster(r);
        setSubjects(Array.isArray(s) ? s : []);
      }
    }).catch(() => toast.error('Failed to load class details'))
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const onInvite = async (values: InviteValues) => {
    if (!id) return;
    try {
      const result = await classesApi.inviteStudent(id, values);
      setInviteResult(result.token);
      resetInvite();
    } catch {
      toast.error('Failed to create invitation');
    }
  };

  const onCreateSubject = async (values: SubjectValues) => {
    if (!id) return;
    try {
      await subjectsApi.create({ classId: id, ...values });
      toast.success('Subject created');
      setSubjectDrawerOpen(false);
      resetSubject();
      const updated = await subjectsApi.list({ classId: id });
      setSubjects(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error('Failed to create subject');
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </>
    );
  }

  if (!classData) {
    return (
      <>
        <PageHeader title="Class not found" />
        <Card>
          <EmptyState
            icon={<IconClasses />}
            title="Class not found"
            description="This class may have been deleted."
            action={<Link to="/classes"><Button>Back to Classes</Button></Link>}
          />
        </Card>
      </>
    );
  }

  const enrolled = roster.length;
  const capacity = classData.capacity;
  const percentage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  return (
    <>
      <PageHeader
        title={`${classData.name} ${classData.section}`}
        description={`Year ${classData.academicYear} · ${enrolled}/${capacity} students`}
        actions={
          <div className="flex gap-2">
            <Link to="/classes">
              <Button variant="outline">All Classes</Button>
            </Link>
            {canManageClasses && (
              <Button onClick={() => setInviteOpen(true)}>
                <IconPlus /> Invite Student
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <CircularProgress value={percentage} size={48} strokeWidth={4} />
            <div>
              <p className="text-2xl font-bold text-content">{enrolled}</p>
              <p className="text-xs text-content-muted">Enrolled / {capacity}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
              <IconClasses />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{subjects.length}</p>
              <p className="text-xs text-content-muted">Subjects</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600">
              <IconStudents />
            </div>
            <div>
              <p className="text-lg font-bold text-content">
                {classData.classTeacher ? fullName(classData.classTeacher.firstName, classData.classTeacher.lastName) : '—'}
              </p>
              <p className="text-xs text-content-muted">Class Teacher</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
              <IconStudents />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{capacity - enrolled}</p>
              <p className="text-xs text-content-muted">Available Slots</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Students"
            action={
              canManageClasses ? (
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <IconPlus /> Invite
                </Button>
              ) : undefined
            }
          />
          <CardBody>
            {roster.length === 0 ? (
              <EmptyState
                icon={<IconStudents />}
                title="No students enrolled"
                description="Invite students to this class."
              />
            ) : (
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {roster.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2">
                    <Avatar firstName={s.firstName} lastName={s.lastName} src={s.photoUrl} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-content">{fullName(s.firstName, s.lastName)}</p>
                      <p className="text-xs text-content-subtle">{s.studentNumber}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === 'ACTIVE' ? 'bg-teal-500/12 text-teal-600' : 'bg-surface-3 text-content-muted'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Subjects"
            action={
              canManageClasses ? (
                <Button size="sm" onClick={() => setSubjectDrawerOpen(true)}>
                  <IconPlus /> Add Subject
                </Button>
              ) : undefined
            }
          />
          <CardBody>
            {subjects.length === 0 ? (
              <EmptyState
                icon={<IconClasses />}
                title="No subjects yet"
                description="Add subjects to this class."
              />
            ) : (
              <div className="space-y-2">
                {subjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-content">{s.name}</p>
                      <p className="text-xs text-content-muted">{s.code}</p>
                      {s.description && (
                        <p className="text-xs text-content-subtle mt-1">{s.description}</p>
                      )}
                    </div>
                    {s.teacher && (
                      <span className="text-xs text-content-muted">
                        {fullName(s.teacher.firstName, s.teacher.lastName)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteResult(null); }} title="Invite Student to Class" size="md">
        {inviteResult ? (
          <div className="space-y-4">
            <p className="text-sm text-content-muted">Share this invitation link with the student:</p>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="break-all text-sm text-content font-mono">{`${window.location.origin}/signup/?token=${inviteResult}`}</p>
            </div>
            <p className="text-xs text-content-subtle">This link expires in 7 days. The student will be automatically enrolled in this class upon registration.</p>
            <div className="flex justify-end">
              <Button onClick={() => { setInviteOpen(false); setInviteResult(null); }}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit(onInvite)} className="space-y-4" noValidate>
            <Input label="First Name" placeholder="John" error={inviteErrors.firstName?.message} {...registerInvite('firstName')} />
            <Input label="Last Name" placeholder="Doe" error={inviteErrors.lastName?.message} {...registerInvite('lastName')} />
            <Input label="Email" type="email" placeholder="john@example.com" error={inviteErrors.email?.message} {...registerInvite('email')} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" loading={inviteSubmitting}>Generate Link</Button>
            </div>
          </form>
        )}
      </Modal>

      <Drawer
        open={subjectDrawerOpen}
        onClose={() => setSubjectDrawerOpen(false)}
        title="Add Subject"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSubjectDrawerOpen(false)}>Cancel</Button>
            <Button form="subject-form" type="submit" loading={subjectSubmitting}>Create</Button>
          </div>
        }
      >
        <form id="subject-form" onSubmit={handleSubjectSubmit(onCreateSubject)} className="space-y-4" noValidate>
          <Input label="Subject Name" placeholder="Mathematics" error={subjectErrors.name?.message} {...registerSubject('name')} />
          <Input label="Subject Code" placeholder="MATH101" error={subjectErrors.code?.message} {...registerSubject('code')} />
          <Input label="Description (optional)" placeholder="Brief description of the subject" error={subjectErrors.description?.message} {...registerSubject('description')} />
        </form>
      </Drawer>
    </>
  );
}
