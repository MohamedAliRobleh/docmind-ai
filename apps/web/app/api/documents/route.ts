import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { docs } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET() {
  try {
    if (IS_DEMO) {
      const list = Object.values(docs).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return NextResponse.json(list)
    }

    const user = await getUser()
    if (!user) return NextResponse.json([])

    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json([])
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([])
  }
}
