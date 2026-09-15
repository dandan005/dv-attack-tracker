// useSupabaseSync.ts
import { useEffect, useRef, useState } from 'react';
import { SupabaseSync } from './sync';

export function useSupabaseSync(table: string, localStore: any) {
  const syncRef = useRef<SupabaseSync | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const sync = new SupabaseSync(table, localStore);
    syncRef.current = sync;

    sync.pullChanges().then(setData);

    sync.subscribeRealtime((payload) => {
      setData((prev) => {
        const next = prev.filter((r) => r.id !== payload.new?.id && r.id !== payload.old?.id);
        return payload.new ? [...next, payload.new] : next;
      });
    });

    const handleOnline = () => sync.pushQueuedChanges();
    const handleVisible = () => {
      if (document.visibilityState === 'visible') sync.pullChanges().then(setData);
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisible);
      sync.destroy();
    };
  }, [table]);

  return { data, sync: syncRef.current };
}
