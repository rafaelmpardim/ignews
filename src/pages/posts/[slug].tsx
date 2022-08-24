import { Head } from "../../../node_modules/next/document"
import { GetServerSideProps } from "../../../node_modules/next/types/index"
import { getSession } from "../../../node_modules/next-auth/react/index"

import { getPrismicClient } from "../../services/prismic"
import { RichText } from 'prismic-dom'

import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) { 
  return (
    <>
      {/* <Head>
        <title>{post.title} | Ignews</title>
      </Head> */}
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{__html: post.content}}
          >
          </div>
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession()

  const { slug } = params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('p', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    }
  }
}