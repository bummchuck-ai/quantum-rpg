import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// Stripe Price IDs
export const PRICES = {
  STANDARD_MONTHLY: 'price_1THN7XJHJP8oL7R34UUTsQ73',
  PREMIUM_MONTHLY: 'price_1THN7YJHJP8oL7R3lvCngsFV',
  CREDITS_10: 'price_1THN79JHJP8oL7R3wdyukevp',
  CREDITS_50: 'price_1THN7AJHJP8oL7R38zVN1wnf',
  CREDITS_150: 'price_1THN7BJHJP8oL7R3piiiNgMu',
} as const;

// Map price IDs to credit amounts
export const CREDIT_AMOUNTS: Record<string, number> = {
  [PRICES.CREDITS_10]: 10,
  [PRICES.CREDITS_50]: 50,
  [PRICES.CREDITS_150]: 150,
};

// Tier daily request limits
export const TIER_LIMITS: Record<string, number> = {
  free: 5,
  standard: 30,
  premium: 100,
};

// Map price IDs to tier names
export const PRICE_TO_TIER: Record<string, string> = {
  [PRICES.STANDARD_MONTHLY]: 'standard',
  [PRICES.PREMIUM_MONTHLY]: 'premium',
};
