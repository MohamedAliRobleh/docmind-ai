import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument } from '@/lib/claude'
import { createServerSupabase, getUser, getUserNiche } from '@/lib/supabase-server'
import { getNicheConfig } from '@/lib/niches'
import { docs } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function POST(request: NextRequest) {
  try {
    const { doc_id } = await request.json()
    let content: string
    let niche: string | null = null

    if (IS_DEMO) {
      const doc = docs[doc_id]
      if (!doc) return NextResponse.json({ error: 'Document not found. Please re-upload your PDF.' }, { status: 404 })
      content = doc.content
      // In demo mode, get niche from request header (sent by client)
      niche = request.headers.get('x-user-niche')
    } else {
      const supabase = createServerSupabase()
      const { data: doc, error } = await supabase.from('documents').select('content').eq('id', doc_id).single()
      if (error || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      content = doc.content
      niche = await getUserNiche()
    }

    const nicheConfig = getNicheConfig(niche)
    const summary = await analyzeDocument(content, 'summary', undefined, nicheConfig.prompts.summary)
    return NextResponse.json({ summary })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to generate summary' }, { status: 500 })
  }
}
