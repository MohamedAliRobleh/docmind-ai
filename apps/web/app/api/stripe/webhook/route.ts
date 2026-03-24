import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const body = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  switch (event.type) {
    // Subscription created or renewed
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (!userId || !session.subscription) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0].price.id
      const plan = priceId === process.env.STRIPE_PRICE_PRO ? 'pro'
        : priceId === process.env.STRIPE_PRICE_BUSINESS ? 'business'
        : 'free'

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_id: subscription.id,
        stripe_customer_id: session.customer as string,
        plan,
        status: 'active',
      }, { onConflict: 'user_id' })

      console.log(`[webhook] Subscription activated: user=${userId} plan=${plan}`)
      break
    }

    // Payment renewed
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.subscription) break

      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = subscription.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'active' })
        .eq('user_id', userId)

      console.log(`[webhook] Payment renewed: user=${userId}`)
      break
    }

    // Subscription cancelled
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ plan: 'free', status: 'cancelled' })
        .eq('user_id', userId)

      console.log(`[webhook] Subscription cancelled: user=${userId}`)
      break
    }

    // Payment failed
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.subscription) break

      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = subscription.metadata?.user_id
      if (!userId) break

      await supabase.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('user_id', userId)

      console.log(`[webhook] Payment failed: user=${userId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
