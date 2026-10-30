import { create } from 'zustand';

interface ChatState {
  /** Bumped whenever chat history is cleared from Profile > Privacy — Chat
   * stays mounted in the background (it's a Tabs.Screen), so its own
   * useChat() instance has no other way to learn its already-loaded
   * messages were deleted out from under it. useChat() re-fetches whenever
   * this changes. */
  clearedAt: number;
  signalCleared: () => void;
  /** A message another screen wants sent on the user's behalf (an exercise
   * demo's "Ask the trainer"). The Chat screen sends it once its history has
   * loaded, then clears it — a store rather than a route param because Chat
   * may already be mounted and a stale param would re-send on every focus. */
  pendingMessage: string | null;
  queueMessage: (message: string) => void;
  takePendingMessage: () => string | null;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  clearedAt: 0,
  signalCleared: () => set({ clearedAt: Date.now() }),
  pendingMessage: null,
  queueMessage: (message) => set({ pendingMessage: message }),
  takePendingMessage: () => {
    const message = get().pendingMessage;
    if (message) set({ pendingMessage: null });
    return message;
  },
}));
