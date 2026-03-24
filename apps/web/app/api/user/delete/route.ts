import { NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'

export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const supabase = createServerSupabase()

    // Delete user's documents and related data
    await supabase.from('conversations').delete().eq('doc_id',
      supabase.from('documents').select('id').eq('user_id', user.id)
    )
    await supabase.from('documents').delete().eq('user_id', user.id)
    await supabase.from('subscriptions').delete().eq('user_id', user.id)

    // Delete the auth user (requires service role key in production)
    // For now, sign out — full deletion needs Supabase admin API
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
