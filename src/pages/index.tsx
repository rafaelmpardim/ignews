/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { GetStaticProps } from 'next/types'

import { stripe } from '../services/stripe'

import { SubscribeButton } from '../components/SubscribeButton'

import styles from '../styles/home.module.scss'
import { Footer } from '../components/Footer'

interface HomeProps {
  product: {
    priceId: string,
    amount: number
  }
}

export default function Home({ product }: HomeProps) {

	return (
		<>
			<Head>
				<title>Ignews | Home</title>
			</Head>

			<main className={styles.contentContainer}>
				<section className={styles.hero}>
					<span>👏 Olá, seja bem-vindo!</span>
					<h1>Acompanhe meus artigos sobre <span>tecnologia</span></h1>
					<p>
            Tenha acesso ao conteúdo completo<br/>
						<span>pagando {product.amount} ao mês</span>
					</p>
					<SubscribeButton priceId={product.priceId}/>
				</section>
				<img src="/images/avatar.svg" alt="Gril coding" />
			</main>

			<Footer />
		</>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID_SUBSCRIPTION)

	const product = {
		priceId: price.id,
		amount: new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		},).format(price.unit_amount / 100)
	}

	return {
		props: {
			product
		},
		revalidate: 60 * 60 * 24 // 24 hours
	}
}