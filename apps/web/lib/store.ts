// In-memory store using global to share state across all Next.js route bundles
// Resets on server restart — replace with real Supabase once credentials are added

export interface Doc {
  id: string
  user_id: string
  name: string
  content: string
  created_at: string
}

export interface Conversation {
  doc_id: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

declare global {
  // eslint-disable-next-line no-var
  var __docmind_docs: Record<string, Doc>
  // eslint-disable-next-line no-var
  var __docmind_conversations: Record<string, Conversation>
}

if (!global.__docmind_docs) global.__docmind_docs = {}
if (!global.__docmind_conversations) global.__docmind_conversations = {}

export const docs = global.__docmind_docs
export const conversations = global.__docmind_conversations
