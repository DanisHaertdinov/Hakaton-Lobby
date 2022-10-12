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
    const { userName } = JSON.parse(req.body);

    if (users.length >= MAX_USERS) {
      return res
        .status(200)
        .json({ error: "Maximum number of users exceeded" });
    }

    if (users.some(({ name }) => name === userName)) {
      return res.status(200).json({ error: "Nickname already in use" });
    }

    users.push({ name: userName });
    response.userNickname = userName;

    res.setHeader(
      "Set-Cookie",
      serialize("nickname", `${userName}`, { path: "/" })
    );
  }

  if (req.method === "DELETE") {
    const { reset } = JSON.parse(req.body);

    if (reset) {
      users = [];
    }
    const { userName } = JSON.parse(req.body);
    users = users.filter(({ name }) => name !== userName);
    response.users = users;

    res.setHeader("Set-Cookie", serialize("nickname", ``, { path: "/" }));
  }

  return res.status(200).json(response);
}
