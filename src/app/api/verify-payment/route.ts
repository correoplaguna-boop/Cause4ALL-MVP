import { NextRequest, NextResponse } from 'next/server'
import { retrieveCheckoutSession } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await retrieveCheckoutSession(sessionId)

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      amount: (session.amount_total || 0) / 100,
      donationAmount: parseFloat(session.metadata?.donation_amount || '0'),
      productAmount: parseFloat(session.metadata?.product_amount || '0'),
      email: session.customer_email,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
