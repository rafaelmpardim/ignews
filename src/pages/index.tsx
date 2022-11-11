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

				{/* <!-- Meta SEO --> */}
				<meta name="author" content="Rafael Pardim" />
				<meta name="description" content="Novidades diárias da bolha tech ao seu alcance!" />
				<meta name="robots" content="index, follow" />

				{/* <!-- Meta SEO Social - Facebook --> */}
				<meta property="og:type" content="company" />
				<meta property="og:url" content="https://rafaelmpardim-ignews.vercel.app" />
				<meta property="og:site_name" content="Ignews - Newslatter da bolha tech" />
				<meta property="og:title" content="Ignews" />
				<meta property="og:description" content="Novidades diárias da bolha tech ao seu alcance!" />
				<meta property="og:image" content="https://user-images.githubusercontent.com/83538547/201237436-0c249834-5b2c-4e55-af23-240a6d7a2af3.png" />

				{/* <!--  Meta SEO Social - Twitter --> */}
				<meta name="twitter:cards" content="summary" />
				<meta name="twitter:url" content="https://rafaelmpardim-ignews.vercel.app" />
				<meta name="twitter:title" content="Ignews - Newslatter da bolha tech" />
				<meta name="twitter:description" content="Novidades diárias da bolha tech ao seu alcance!" />
				<meta property="twitter:image" content="https://user-images.githubusercontent.com/83538547/201237436-0c249834-5b2c-4e55-af23-240a6d7a2af3.png" />
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