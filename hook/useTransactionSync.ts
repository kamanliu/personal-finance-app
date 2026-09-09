import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function useTransactionSync(userId: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Listen to all row changes specifically inside our job board table
    const syncChannel = supabase
      .channel('public:sync_queue')
      .on(
        'postgres_changes',
        {
          event: '*', // Catching both the initial INSERT and the status updates
          schema: 'public',
          table: 'sync_queue',
        },
        (payload) => {
          const { status } = payload.new as any;
          
          console.log(` Realtime sync update: ${status}`);
          setSyncStatus(status);

          if (status === 'pending' || status === 'processing') {
            setIsSyncing(true);
          } else {
            setIsSyncing(false); // Shuts down smoothly on 'completed' or 'failed'
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(syncChannel);
    };
  }, [userId]);

  return { isSyncing, syncStatus };
}