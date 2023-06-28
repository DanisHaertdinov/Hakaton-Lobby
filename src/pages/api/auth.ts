import { NextApiRequest, NextApiResponse } from "next";
import { OAuthApp } from "@octokit/oauth-app";
import { serialize } from "cookie";

import { gitHubID, gitHubSecret } from "../../config";

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

  res.setHeader("Set-Cookie", serialize("userId", `${token}`, { path: "/" }));
  res.redirect("/");
}
