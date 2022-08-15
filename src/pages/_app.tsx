import { AppProps } from '../../node_modules/next/app'

import '../styles/global.scss'

export default function MyApp ({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}