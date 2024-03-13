import { NextApiRequest, NextApiResponse } from "next";
import { OAuthApp } from "@octokit/oauth-app";
import { serialize } from "cookie";
import { nanoid } from "nanoid";
import { gitHubID, gitHubSecret } from "../../config";
import { getUserByToken } from "../../utils/user";
import { User } from "./mongo/user/model";
import { Session } from "./mongo/session/model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query as { code: string };
  const app = new OAuthApp({
    clientType: "github-app",
    clientId: gitHubID,
    clientSecret: gitHubSecret,
    code,
  });

  const {
    authentication: { token },
  } = await app.createToken({
    code,
  });

  const user = await getUserByToken(token);

  let userDB = await User.findOne({ gitHubId: user.gitHubId });

  if (!userDB) {
    userDB = await new User(user).save();
  }

  const userToken = nanoid();

  await new Session({ userId: userDB.id, token: userToken }).save();
  res.setHeader(
    "Set-Cookie",
    serialize("hackToken", `${userToken}`, { path: "/" })
  );

  res.redirect("/");
}
