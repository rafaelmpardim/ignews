import styles from './styles.module.scss'

import Head from '../../../node_modules/next/head'

export default function Posts() {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="">
            <time>20/08/2022</time>
            <strong>Lorem ipsum dolor sit amet, consectet</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, numquam? Quas minus natus illo quis at. Impedit vel repellendus pariatur asperiores assumenda corporis sunt. Earum quasi sequi nobis? Odio, distinctio?</p>
          </a>
          <a href="">
            <time>20/08/2022</time>
            <strong>Lorem ipsum dolor sit amet, consectet</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, numquam? Quas minus natus illo quis at. Impedit vel repellendus pariatur asperiores assumenda corporis sunt. Earum quasi sequi nobis? Odio, distinctio?</p>
          </a>
          <a href="">
            <time>20/08/2022</time>
            <strong>Lorem ipsum dolor sit amet, consectet</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, numquam? Quas minus natus illo quis at. Impedit vel repellendus pariatur asperiores assumenda corporis sunt. Earum quasi sequi nobis? Odio, distinctio?</p>
          </a>
          <a href="">
            <time>20/08/2022</time>
            <strong>Lorem ipsum dolor sit amet, consectet</strong>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, numquam? Quas minus natus illo quis at. Impedit vel repellendus pariatur asperiores assumenda corporis sunt. Earum quasi sequi nobis? Odio, distinctio?</p>
          </a>
        </div>
      </main>
    </>
  )
}