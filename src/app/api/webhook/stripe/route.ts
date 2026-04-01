import { NextResponse } from 'next/server';
import { stripe, CREDIT_AMOUNTS, PRICE_TO_TIER } from '../../../../lib/stripe';
import { createServerClient } from '../../../../lib/supabase-server';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const priceId = session.metadata?.price_id;
      if (!userId || !priceId) break;

      // Credit purchase
      const creditAmount = CREDIT_AMOUNTS[priceId];
      if (creditAmount) {
        await supabase.rpc('add_credits', { p_user_id: userId, p_amount: creditAmount });
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'credit_purchase',
          amount_cents: session.amount_total || 0,
          credits_added: creditAmount,
          stripe_session_id: session.id,
        });
        break;
      }

      // Subscription
      const tier = PRICE_TO_TIER[priceId];
      if (tier) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'subscription',
          amount_cents: session.amount_total || 0,
          stripe_session_id: session.id,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      // Find user by Stripe customer ID and downgrade to free
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
