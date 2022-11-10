/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "../../../node_modules/next/dist/shared/lib/utils"
import { getSession } from '../../../node_modules/next-auth/react'

import { stripe } from "../../services/stripe"

import { fauna } from "../../services/fauna"
import { query as q } from "../../../node_modules/faunadb/index"

interface UserData {
  ref: {
    id: string
  },
  data: {
    email: string,
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({ req })

    const user: UserData = await fauna.query(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id), {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_SUBSCRIPTION,
          quantity: 1
        }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}
