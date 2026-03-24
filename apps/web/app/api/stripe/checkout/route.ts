import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUser } from '@/lib/supabase-server'

const IS_STRIPE_DEMO = !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY.includes('placeholder')

export async function POST(request: NextRequest) {
  try {
    if (IS_STRIPE_DEMO) {
      return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { plan } = await request.json()
    const priceId = plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_BUSINESS

    if (!priceId || priceId.includes('placeholder') || priceId.startsWith('prod_')) {
      return NextResponse.json({
        error: 'Price ID invalide. Tu as mis un Product ID (prod_xxx) au lieu d\'un Price ID (price_xxx). Va dans Stripe → Products → ton produit → section Pricing → copie l\'ID price_xxx.'
      }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('[checkout] Stripe error:', e.message)
    return NextResponse.json({ error: e.message || 'Erreur Stripe' }, { status: 500 })
  }
}
