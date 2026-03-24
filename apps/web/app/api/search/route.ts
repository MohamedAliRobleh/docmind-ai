import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { docs } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export interface SearchResult {
  id: string
  name: string
  created_at: string
  matchType: 'name' | 'content' | 'both'
  snippet?: string
}

function getSnippet(content: string, query: string): string {
  const lower = content.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - 80)
  const end = Math.min(content.length, idx + query.length + 120)
  return (start > 0 ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '')
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q || q.length < 2) return NextResponse.json([])

  const qLower = q.toLowerCase()

  if (IS_DEMO) {
    const results: SearchResult[] = Object.values(docs)
      .filter(doc => {
        const inName = doc.name.toLowerCase().includes(qLower)
        const inContent = doc.content.toLowerCase().includes(qLower)
        return inName || inContent
      })
      .map(doc => {
        const inName = doc.name.toLowerCase().includes(qLower)
        const inContent = doc.content.toLowerCase().includes(qLower)
        return {
          id: doc.id,
          name: doc.name,
          created_at: doc.created_at,
          matchType: inName && inContent ? 'both' : inName ? 'name' : 'content',
          snippet: inContent ? getSnippet(doc.content, q) : undefined,
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(results)
  }

  const user = await getUser()
  if (!user) return NextResponse.json([])

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, created_at, content')
    .eq('user_id', user.id)
    .or(`name.ilike.%${q}%,content.ilike.%${q}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !data) return NextResponse.json([])

  const results: SearchResult[] = data.map(doc => {
    const inName = doc.name.toLowerCase().includes(qLower)
    const inContent = doc.content.toLowerCase().includes(qLower)
    return {
      id: doc.id,
      name: doc.name,
      created_at: doc.created_at,
      matchType: inName && inContent ? 'both' : inName ? 'name' : 'content',
      snippet: inContent ? getSnippet(doc.content, q) : undefined,
    }
  })

  return NextResponse.json(results)
}
