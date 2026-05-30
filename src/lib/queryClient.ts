import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Do not retry auth/permission errors.
        if (error instanceof ApiClientError && [400, 401, 403, 404, 422].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
