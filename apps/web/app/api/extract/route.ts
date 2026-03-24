import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument } from '@/lib/claude'
import { createServerSupabase, getUserNiche } from '@/lib/supabase-server'
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
      niche = request.headers.get('x-user-niche')
    } else {
      const supabase = createServerSupabase()
      const { data: doc, error } = await supabase.from('documents').select('content').eq('id', doc_id).single()
      if (error || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      content = doc.content
      niche = await getUserNiche()
    }

    const nicheConfig = getNicheConfig(niche)
    const extracted = await analyzeDocument(content, 'extract', undefined, nicheConfig.prompts.extract)

    let data: any[] = []
    try {
      const clean = extracted.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
      const match = clean.match(/\[[\s\S]*\]/)
      data = JSON.parse(match ? match[0] : clean)
      if (!Array.isArray(data)) data = [{ type: 'result', value: String(data) }]
    } catch {
      data = [{ type: 'raw', value: extracted }]
    }

    if (data.length === 0) {
      return NextResponse.json({ data: [], message: 'Aucune donnée structurée trouvée dans ce document.' })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to extract data' }, { status: 500 })
  }
}
