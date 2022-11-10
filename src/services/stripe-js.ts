import { loadStripe } from '@stripe/stripe-js/pure'

export async function getStripeJs() {
	const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

	return stripeJs
}