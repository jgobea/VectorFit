import { create } from 'zustand';

interface ChatState {
  /** Bumped whenever chat history is cleared from Profile > Privacy — Chat
   * stays mounted in the background (it's a Tabs.Screen), so its own
   * useChat() instance has no other way to learn its already-loaded
   * messages were deleted out from under it. useChat() re-fetches whenever
   * this changes. */
  clearedAt: number;
  signalCleared: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  clearedAt: 0,
  signalCleared: () => set({ clearedAt: Date.now() }),
}));
