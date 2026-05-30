import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/endpoints';
import { IconBell } from '@/components/ui/icons';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', { page: 1 }],
    queryFn: () => notificationsApi.list({ page: 1, limit: 10 }),
    refetchInterval: 60_000,
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markOne = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.data ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2 text-content-muted hover:bg-surface-3 hover:text-content"
        aria-label="Notifications"
      >
        <IconBell />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-navy-900">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-heading text-sm font-semibold">Notifications</h3>
              {unread > 0 && (
                <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyState title="You're all caught up" description="No notifications yet." />
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markOne.mutate(n.id)}
                    className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-2">
                      {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
                      <span className="text-sm font-medium text-content">{n.title}</span>
                    </div>
                    <span className="text-xs text-content-muted">{n.body}</span>
                    <span className="text-[11px] text-content-subtle">{formatDateTime(n.sentAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
