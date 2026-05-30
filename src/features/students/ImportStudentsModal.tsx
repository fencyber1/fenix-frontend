import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentsApi } from '@/api/endpoints';
import { errorMessage } from '@/lib/formErrors';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

const TEMPLATE = 'studentNumber,firstName,lastName,dob,gender,admissionDate';

export function ImportStudentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [csv, setCsv] = useState('');
  const [result, setResult] = useState<{ created: number; skipped: number; errors: { row: number; message: string }[] } | null>(null);

  const mutation = useMutation({
    mutationFn: () => studentsApi.import(csv),
    onSuccess: (res) => {
      setResult(res);
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Imported ${res.created} student(s)`);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  const close = () => {
    setCsv('');
    setResult(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Import students from CSV" size="lg">
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-2 p-3 text-xs text-content-muted">
          <p className="font-medium text-content">Required header row:</p>
          <code className="mt-1 block font-mono text-[11px]">{TEMPLATE}</code>
          <p className="mt-1">Dates as YYYY-MM-DD · gender MALE | FEMALE | OTHER. Existing student numbers are skipped.</p>
        </div>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="block w-full text-sm text-content-muted file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-teal-400"
        />

        <Textarea
          label="Or paste CSV content"
          rows={8}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={`${TEMPLATE}\nS-001,Ada,Lovelace,2014-12-10,FEMALE,2026-01-10`}
          className="font-mono text-xs"
        />

        {result && (
          <div className="rounded-xl border border-border p-3 text-sm">
            <p className="text-success-600">Created: {result.created}</p>
            <p className="text-content-muted">Skipped (already exist): {result.skipped}</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-danger-500">Errors ({result.errors.length}):</p>
                <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto text-xs text-danger-500">
                  {result.errors.map((e) => (
                    <li key={e.row}>Row {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!csv.trim()}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
