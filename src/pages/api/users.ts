import { NextApiRequest, NextApiResponse } from "../../../node_modules/next/dist/shared/lib/utils"

export default (request: NextApiRequest, response: NextApiResponse) => {
  const users = [
    {id: 1, name: 'Lucas'},
    {id: 2, name: 'Rafael'},
    {id: 3, name: 'Raphael'}
  ]

  return response.json(users)
}