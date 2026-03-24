import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument, streamChatResponse } from '@/lib/claude'
import { createServerSupabase, getUserNiche } from '@/lib/supabase-server'
import { getNicheConfig } from '@/lib/niches'
import { docs, conversations } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(request: NextRequest) {
  const doc_id = request.nextUrl.searchParams.get('doc_id') ?? ''

  if (IS_DEMO) {
    return NextResponse.json({ history: conversations[doc_id]?.messages ?? [] })
  }

  const supabase = createServerSupabase()
  const { data } = await supabase.from('conversations').select('messages').eq('doc_id', doc_id).single()
  return NextResponse.json({ history: data?.messages ?? [] })
}

export async function POST(request: NextRequest) {
  const { doc_id, message, history } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  let content: string
  let niche: string | null = null

  if (IS_DEMO) {
    const doc = docs[doc_id]
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    content = doc.content
    niche = request.headers.get('x-user-niche')
  } else {
    const supabase = createServerSupabase()
    const { data: doc, error } = await supabase.from('documents').select('content').eq('id', doc_id).single()
    if (error || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    content = doc.content
    niche = await getUserNiche()
  }

  const nicheConfig = getNicheConfig(niche)
  const useStream = request.nextUrl.searchParams.get('stream') === 'true'
  const conversation = (history ?? []).map((h: any) => `${h.role}: ${h.content}`).join('\n')
  const fullQuestion = history?.length ? `${conversation}\nUser: ${message}` : message

  if (useStream) {
    const stream = await streamChatResponse(content, fullQuestion, nicheConfig.prompts.chat)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Doc-Id': doc_id,
      },
    })
  }

  // Non-streaming fallback
  const response = await analyzeDocument(content, 'chat', fullQuestion, nicheConfig.prompts.chat)
  const newHistory = [...(history ?? []), { role: 'user', content: message }, { role: 'assistant', content: response }]

  if (IS_DEMO) {
    conversations[doc_id] = { doc_id, messages: newHistory }
  } else {
    const supabase = createServerSupabase()
    await supabase.from('conversations').upsert({ doc_id, messages: newHistory }, { onConflict: 'doc_id' })
  }

  return NextResponse.json({ response })
}

export async function PATCH(request: NextRequest) {
  const { doc_id, messages } = await request.json()
  if (!doc_id || !messages) return NextResponse.json({ ok: true })

  if (IS_DEMO) {
    conversations[doc_id] = { doc_id, messages }
  } else {
    const supabase = createServerSupabase()
    await supabase.from('conversations').upsert({ doc_id, messages }, { onConflict: 'doc_id' })
  }

  return NextResponse.json({ ok: true })
}
