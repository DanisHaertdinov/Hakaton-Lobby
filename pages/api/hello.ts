// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

const users = [{ name: 'John Doe' }]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  if (req.method === 'POST') {
    users.push({name: req.body})
  }
  res.status(200).json(users)
}
