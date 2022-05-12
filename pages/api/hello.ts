// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MAX_USERS } from "../../src/const";
import { User } from "../../src/types";

type Error = {
  error: string;
};

const users: User[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[] | Error>
) {
  if (req.method === "POST") {
    if (users.length > MAX_USERS) {
      return res
        .status(200)
        .json({ error: "maximum number of users exceeded" });
    }
    users.push({ name: req.body });
  }
  res.status(200).json(users);
}
