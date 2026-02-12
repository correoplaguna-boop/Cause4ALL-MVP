import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export interface CreateCheckoutParams {
  campaignId: string
  campaignTitle: string
  amount: number // Total amount in euros
  donationAmount: number // Portion that goes to cause
  productAmount: number // Portion for "product"
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession({
  campaignId,
  campaignTitle,
  amount,
  donationAmount,
  productAmount,
  customerEmail,
  successUrl,
  cancelUrl,
}: CreateCheckoutParams): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Apoyo solidario: ${campaignTitle}`,
            description: `Donación: ${donationAmount.toFixed(2)}€ | Producto solidario: ${productAmount.toFixed(2)}€`,
          },
          unit_amount: Math.round(amount * 100), // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      campaign_id: campaignId,
      donation_amount: donationAmount.toString(),
      product_amount: productAmount.toString(),
      total_amount: amount.toString(),
    },
    payment_intent_data: {
      metadata: {
        campaign_id: campaignId,
        donation_amount: donationAmount.toString(),
        product_amount: productAmount.toString(),
      },
    },
  })

  return session
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    })
    return session
  } catch (error) {
    console.error('Error retrieving session:', error)
    return null
  }
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
