import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { docs, conversations } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (IS_DEMO) {
    const doc = docs[id]
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ id: doc.id, name: doc.name, created_at: doc.created_at })
  }

  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (IS_DEMO) {
    if (!docs[id]) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    delete docs[id]
    delete conversations[id]
    return NextResponse.json({ success: true })
  }

  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const supabase = createServerSupabase()
  // Verify ownership before deleting
  const { data: doc } = await supabase
    .from('documents')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (doc.user_id !== user.id) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
