import NextAuth from '../../../../node_modules/next-auth/index'
import GithubProvider from '../../../../node_modules/next-auth/providers/github'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ]
})