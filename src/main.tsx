import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { App } from '@/app/App';
import { queryClient } from '@/lib/queryClient';
import '@/styles/index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'rounded-xl border border-border bg-surface text-content shadow-card',
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
