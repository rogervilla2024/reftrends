import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-12-15.clover',
    });
  }
  return stripeInstance;
}

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    name: 'Monthly',
    price: 9.99,
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    name: 'Yearly',
    price: 79.99,
    interval: 'year',
    savings: '33%',
  },
} as const;
