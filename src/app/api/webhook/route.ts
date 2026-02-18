import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { recordDonation, updateCampaignAmount } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[Webhook] Event received:', event.type)

  // Handle different event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('[Webhook] Checkout completed:', {
      sessionId: session.id,
      amount: session.amount_total,
      metadata: session.metadata,
    })

    const campaignId = session.metadata?.campaign_id
    const donationAmount = parseFloat(session.metadata?.donation_amount || '0')
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0

    if (!campaignId) {
      console.error('[Webhook] Missing campaign_id in metadata')
      return NextResponse.json({ error: 'Missing campaign_id' }, { status: 400 })
    }

    if (!donationAmount || donationAmount <= 0) {
      console.error('[Webhook] Invalid donationAmount:', donationAmount)
      return NextResponse.json({ error: 'Invalid donationAmount' }, { status: 400 })
    }

    // Record donation in database
    try {
      await recordDonation({
        campaign_id: campaignId,
        amount: totalAmount,
        donation_amount: donationAmount,
        customer_email: session.customer_details?.email || null,
        stripe_session_id: session.id,
        status: 'completed',
      })
      
      console.log('[Webhook] Donation recorded successfully')
      
      // Update campaign amount with ONLY the donation amount
      await updateCampaignAmount(campaignId, donationAmount)
      
      console.log('[Webhook] Campaign amount updated successfully with donation:', donationAmount)
    } catch (dbError) {
      console.error('[Webhook] Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('[Webhook] Payment succeeded:', paymentIntent.id)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.error('[Webhook] Payment failed:', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}
