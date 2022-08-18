import { serialize } from "cookie";

import { MAX_USERS } from "../../const";
import { User, UsersResponse } from "../../types";

import type { NextApiRequest, NextApiResponse } from "next";

type Error = {
  error: string;
};

let users: User[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse | Error>
) {
  const response: UsersResponse = {
    users,
  };

  if (req.method === "POST") {
    if (users.length >= MAX_USERS) {
      return res
        .status(200)
        .json({ error: "Maximum number of users exceeded" });
    }

    if (users.some(({ name }) => name === req.body)) {
      return res.status(200).json({ error: "Nickname already in use" });
    }

    users.push({ name: req.body });
    response.userNickname = req.body;

    res.setHeader(
      "Set-Cookie",
      serialize("nickname", `${req.body}`, { path: "/" })
    );
  }

  if (req.method === "DELETE") {
    users = users.filter(({ name }) => name === req.body);
    response.users = users;

    res.setHeader("Set-Cookie", serialize("nickname", ``, { path: "/" }));
  }

  return res.status(200).json(response);
}
