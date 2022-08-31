import { AppProps } from '../../node_modules/next/app'

import { Header } from '../components/Header/index'

import { SessionProvider as NextAuthProvider } from '../../node_modules/next-auth/react'

import '../styles/global.scss'

export default function MyApp ({ Component, pageProps: { session, ...pageProps} }: AppProps) {
  return (
    <NextAuthProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  )
}