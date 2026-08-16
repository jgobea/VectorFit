export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Local-only rendering state layered on top of the persisted row — never
// written to Supabase, cleared once a reply finishes streaming.
export interface ChatUIMessage extends ChatMessage {
  isStreaming?: boolean;
}
