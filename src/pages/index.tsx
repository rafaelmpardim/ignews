import Head from '../../node_modules/next/head'
import { SubscribeButton } from '../components/SubscribeButton/index'

import styles from './home.module.scss'

export default function Home() {
  return (
    <>
      <Head>
        <title>ig.news | Home</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications<br/>
            <span>for $9.98 month</span>
          </p>
          <SubscribeButton />
        </section>
        <img src="/images/avatar.svg" alt="Gril coding" />
      </main>
    </>
  )
}