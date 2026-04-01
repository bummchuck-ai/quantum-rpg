import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';
import { TIER_LIMITS } from '../../../lib/stripe';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, daily_requests_used, daily_reset_at, credits')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 });
  }

  // Reset daily counter if past midnight
  const now = new Date();
  const resetAt = new Date(profile.daily_reset_at);
  let dailyUsed = profile.daily_requests_used;

  if (now > resetAt) {
    const nextReset = new Date();
    nextReset.setHours(24, 0, 0, 0); // Next midnight
    dailyUsed = 0;
    await supabase
      .from('profiles')
      .update({ daily_requests_used: 0, daily_reset_at: nextReset.toISOString() })
      .eq('user_id', user.id);
  }

  const tier = profile.subscription_tier;
  const dailyLimit = TIER_LIMITS[tier] || 5;

  return NextResponse.json({
    tier,
    dailyUsed,
    dailyLimit,
    dailyRemaining: Math.max(0, dailyLimit - dailyUsed),
    credits: profile.credits,
  });
}
