import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiClientError } from '@/api/client';

/**
 * Maps an API error onto react-hook-form field errors and shows a toast for the
 * top-level message. Field-level messages from the server appear inline.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
): void {
  if (error instanceof ApiClientError) {
    if (setError && error.fieldErrors.length > 0) {
      for (const fe of error.fieldErrors) {
        setError(fe.field as Path<T>, { type: 'server', message: fe.message });
      }
      toast.error(error.message);
      return;
    }
    toast.error(error.message);
    return;
  }
  toast.error('Something went wrong. Please try again.');
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
