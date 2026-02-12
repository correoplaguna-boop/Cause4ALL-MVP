import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, campaignTitle, amount, donationAmount, productAmount, email } = body

    if (!campaignId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      campaignId,
      campaignTitle: campaignTitle || 'Campaña solidaria',
      amount: parseFloat(amount),
      donationAmount: parseFloat(donationAmount) || amount,
      productAmount: parseFloat(productAmount) || 0,
      customerEmail: email,
      successUrl: `${baseUrl}/success`,
      cancelUrl: `${baseUrl}/c/${campaignId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
