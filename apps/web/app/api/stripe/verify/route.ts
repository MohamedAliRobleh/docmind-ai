import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase, getUser } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()
    if (!session_id) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 })
    }

    const subscription = session.subscription as any
    if (!subscription) return NextResponse.json({ error: 'Aucune souscription trouvée' }, { status: 400 })

    const priceId = subscription.items.data[0].price.id
    const plan = priceId === process.env.STRIPE_PRICE_PRO ? 'pro'
      : priceId === process.env.STRIPE_PRICE_BUSINESS ? 'business'
      : 'pro' // fallback

    const supabase = createServerSupabase()
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_id: subscription.id,
      stripe_customer_id: session.customer as string,
      plan,
      status: 'active',
    }, { onConflict: 'user_id' })

    return NextResponse.json({ plan })
  } catch (e: any) {
    console.error('[verify] error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
