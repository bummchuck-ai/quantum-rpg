import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';
import { stripe, PRICES } from '../../../lib/stripe';

const VALID_PRICES = new Set(Object.values(PRICES));

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId || !VALID_PRICES.has(priceId)) {
      return NextResponse.json({ error: 'Ungültiger Preis' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    const isSubscription = priceId === PRICES.STANDARD_MONTHLY || priceId === PRICES.PREMIUM_MONTHLY;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/play?payment=success`,
      cancel_url: `${req.headers.get('origin')}/play?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        price_id: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout fehlgeschlagen' }, { status: 500 });
  }
}
