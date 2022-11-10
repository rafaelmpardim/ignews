import { useSession, signIn } from 'next-auth/react'

import { useRouter } from 'next/router'

import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'

import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
	const { data: session } = useSession()
	const router = useRouter()

	async function handleSubscribe() {
		if (!session) {
			signIn()
			return
		}

		if (session?.activeSubscription) {
			router.push('/posts')
			return
		}

		try {
			const response = await api.post('/subscribe')

			const { sessionId } = response.data

			const stripe = await getStripeJs()

			stripe.redirectToCheckout({ sessionId: sessionId })
		}

		catch (err) {
			alert(err.message)
		}
	}

	return (
		<button
			className={styles.subscribeButton}
			type="button"
			onClick={handleSubscribe}
		>
      Se inscreva agora!
		</button>
	)
}