import { NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { docs } from '@/lib/store'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: 50,
  business: Infinity,
}

export async function GET() {
  if (IS_DEMO) {
    const docCount = Object.keys(docs).length
    return NextResponse.json({ plan: 'free', doc_count: docCount, doc_limit: 3 })
  }

  const user = await getUser()
  if (!user) return NextResponse.json({ plan: 'free', doc_count: 0, doc_limit: 3 })

  const supabase = createServerSupabase()

  // Get subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  const plan = (sub?.status === 'active' ? sub.plan : 'free') as string
  const docLimit = PLAN_LIMITS[plan] ?? 3

  // Count docs this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  return NextResponse.json({
    plan,
    doc_count: count ?? 0,
    doc_limit: docLimit === Infinity ? 999999 : docLimit,
  })
}
