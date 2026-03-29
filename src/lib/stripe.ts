import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripeServer() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience alias — throws at runtime if key is missing, not at import time
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeServer() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
