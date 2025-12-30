import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe, PLANS } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
