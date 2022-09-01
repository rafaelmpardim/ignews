import styles from './styles.module.scss'

import Head from '../../../node_modules/next/head'
import Link from '../../../node_modules/next/link'

import { GetStaticProps } from '../../../node_modules/next/types/index'

import { getPrismicClient } from '../../services/prismic'
import * as Prismic from "../../../node_modules/@prismicio/client/dist/index"
import { RichText } from 'prismic-dom'

type Post = {
  slug: string,
  title: string,
  excerpt: string,
  updatedAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <a>
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            ))
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  
  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'p')
  ],
    {
      fetch: ['p.title', 'p.content'],
      pageSize: 100,
    }
  )

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ??  '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    },
    revalidate: 60 * 30 // 30 minutos
  }
}