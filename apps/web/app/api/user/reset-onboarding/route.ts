import { NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'

export async function POST() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const supabase = createServerSupabase()
    await supabase
      .from('profiles')
      .upsert({ id: user.id, onboarding_completed: false }, { onConflict: 'id' })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
