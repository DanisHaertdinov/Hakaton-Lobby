import { serialize } from "cookie";

import { MAX_USERS } from "../../const";
import { User, UsersResponse } from "../../types";

import type { NextApiRequest, NextApiResponse } from "next";

type Error = {
  error: string;
};

const users: User[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse | Error>
) {
  const response: UsersResponse = {
    users,
  };

  if (req.method === "POST") {
    if (users.length > MAX_USERS) {
      return res
        .status(200)
        .json({ error: "maximum number of users exceeded" });
    }
    users.push({ name: req.body });
    response.userNickname = req.body;
    res.setHeader(
      "Set-Cookie",
      serialize("nickname", `${req.body}`, { path: "/" })
    );
  }

  return res.status(200).json(response);
}
