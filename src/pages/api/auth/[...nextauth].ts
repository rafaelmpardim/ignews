import NextAuth from '../../../../node_modules/next-auth/index'
import GithubProvider from '../../../../node_modules/next-auth/providers/github'

import { fauna } from '../../../services/fauna'
import { query as q } from '../../../../node_modules/faunadb/index'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user

      try {
        await fauna.query(
          q.Create(
          q.Collection('users'),
            { data: { email }}
          )
        )
        return true
      }
      catch {
        return false
      }
    },
  }
})