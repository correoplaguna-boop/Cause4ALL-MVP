import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { recordDonation, updateCampaignAmount } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('[Webhook] Received request')

  if (!signature) {
    console.error('[Webhook] Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
    console.log('[Webhook] Event verified:', event.type, 'ID:', event.id)
  } catch (error) {
    console.error('[Webhook] Signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[Webhook] Processing checkout.session.completed:', session.id)

        if (session.payment_status === 'paid') {
          const campaignId = session.metadata?.campaign_id
          const donationAmount = parseFloat(session.metadata?.donation_amount || '0')
          const productAmount = parseFloat(session.metadata?.product_amount || '0')
          const totalAmount = (session.amount_total || 0) / 100

          console.log('[Webhook] Payment details:', {
            campaignId,
            totalAmount,
            donationAmount,
            productAmount,
            email: session.customer_email
          })

          if (!campaignId) {
            console.error('[Webhook] Missing campaign_id in metadata')
            return NextResponse.json({ error: 'Missing campaign_id' }, { status: 400 })
          }

          // Record the donation
          const donationResult = await recordDonation({
            campaign_id: campaignId,
            amount: totalAmount,
            donation_portion: donationAmount,
            product_portion: productAmount,
            email: session.customer_email || '',
            stripe_payment_id: session.payment_intent as string,
            stripe_session_id: session.id,
            enters_draw: true,
            status: 'completed',
          })

          if (donationResult.error) {
            console.error('[Webhook] Error recording donation:', donationResult.error)
            return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 })
          }

          console.log('[Webhook] Donation recorded successfully:', donationResult.data?.id)

          // Update campaign total
          const updateResult = await updateCampaignAmount(campaignId, totalAmount)
          
          if (updateResult.error) {
            console.error('[Webhook] Error updating campaign amount:', updateResult.error)
            // Don't return error here, donation is already recorded
          } else {
            console.log('[Webhook] Campaign amount updated successfully')
          }

          console.log('[Webhook] Checkout session processed successfully')
        } else {
          console.log('[Webhook] Payment status not paid:', session.payment_status)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('[Webhook] Payment failed:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          last_error: paymentIntent.last_payment_error?.message
        })
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Webhook] Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100
        })
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('[Webhook] Error processing event:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
