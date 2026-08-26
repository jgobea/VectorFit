import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Privacy Settings' "Clear Chat History" action — deletes chat_messages
// rows without touching the rest of the account (delete-account is the
// separate, full-account destructive action).
export function useClearChatHistory(userId: string | undefined) {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearChatHistory = useCallback(async () => {
    if (!userId) return false;
    setIsClearing(true);
    setError(null);
    const { error: deleteError } = await supabase.from('chat_messages').delete().eq('user_id', userId);
    setIsClearing(false);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    return true;
  }, [userId]);

  return { clearChatHistory, isClearing, error };
}
