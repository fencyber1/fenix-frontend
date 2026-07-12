import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { documentsApi } from '@/api/endpoints';
import type { TenantDocument } from '@/types/models';
import { usePermissions } from '@/hooks/usePermissions';
import { errorMessage } from '@/lib/formErrors';
import { formatBytes, formatDate } from '@/lib/utils';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconDownload, IconReports, IconTrash, IconUpload } from '@/components/ui/icons';

const TYPES = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'BIRTH_CERTIFICATE', label: 'Birth certificate' },
  { value: 'REPORT_CARD', label: 'Report card' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'ID_CARD', label: 'ID card' },
  { value: 'OTHER', label: 'Other' },
];

export function DocumentsTab({ studentId }: { studentId: string }) {
  const qc = useQueryClient();
  const { isStaff, isAdmin } = usePermissions();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState('OTHER');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<TenantDocument | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', studentId],
    queryFn: () => documentsApi.list(studentId),
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      // 1) Ask the server for a presigned URL (validates MIME + size server-side).
      const presigned = await documentsApi.presign({
        studentId,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        type,
      });
      // 2) Upload the bytes directly to storage via the presigned URL.
      await axios.request({
        url: presigned.uploadUrl,
        method: presigned.method,
        headers: presigned.headers,
        data: file,
      });
      // 3) Confirm so the server persists the document metadata.
      await documentsApi.confirm({
        studentId,
        key: presigned.key,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        type,
      });
      toast.success('Document uploaded');
      qc.invalidateQueries({ queryKey: ['documents', studentId] });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      toast.success('Document removed');
      qc.invalidateQueries({ queryKey: ['documents', studentId] });
      setDeleting(null);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Card>
      <CardHeader
        title="Documents"
        subtitle="Photos, certificates and records (uploaded securely via presigned URLs)."
        action={
          isStaff && (
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select options={TYPES} value={type} onChange={(e) => setType(e.target.value)} />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
              <Button onClick={() => fileRef.current?.click()} loading={uploading}>
                <IconUpload /> Upload
              </Button>
            </div>
          )
        }
      />
      <CardBody>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data || data.length === 0 ? (
          <EmptyState icon={<IconReports />} title="No documents" description="Upload the student's photos, certificates or records." />
        ) : (
          <div className="divide-y divide-border">
            {data.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content">{doc.name}</p>
                  <p className="text-xs text-content-subtle">
                    {doc.type.replace(/_/g, ' ').toLowerCase()} · {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" aria-label="Open"><IconDownload /></Button>
                  </a>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleting(doc)}>
                      <span className="text-danger-500"><IconTrash /></span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete document"
        description={<>Remove <strong>{deleting?.name}</strong>? This soft-deletes the file record.</>}
        confirmLabel="Delete"
        confirmPhrase="DELETE"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
}
