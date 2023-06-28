import { serialize } from "cookie";
import { nanoid } from "nanoid";

import { MAX_USERS } from "../../const";
import { ResponseError, User, UsersData, UsersResponse } from "../../types";
import { generateResponse as basegGenerateResponse } from "../../utils/api";

import type { NextApiRequest, NextApiResponse } from "next";

let users: User[] = [];

const generateResponse = ({
  data,
  error,
}: {
  data?: UsersData;
  error?: ResponseError;
}): UsersResponse => {
  const defaultData: UsersData = {
    users: [],
    lobbyName: "",
  };
  const externalData = data ?? {};

  return basegGenerateResponse<UsersData>(
    { ...defaultData, ...externalData },
    error
  );
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse>
) {
  const data: UsersData = {
    users,
    lobbyName: `hack-lobby-${nanoid()}`,
  };

  if (req.method === "POST") {
    const { userName } = JSON.parse(req.body);

    if (users.length >= MAX_USERS) {
      return res.status(200).json(
        generateResponse({
          error: {
            error: "Maximum number of users exceeded",
          },
        })
      );
    }

    if (users.some(({ name }) => name === userName)) {
      return res
        .status(200)
        .json(
          generateResponse({ error: { error: "Nickname already in use" } })
        );
    }

    users.push({ name: userName });
    data.userNickname = userName;

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
    data.users = users;

    res.setHeader("Set-Cookie", serialize("nickname", ``, { path: "/" }));
  }

  return res.status(200).json(generateResponse({ data }));
}
