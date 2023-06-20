import { NextApiRequest, NextApiResponse } from "next";
import { OAuthApp } from "@octokit/oauth-app";
import { serialize } from "cookie";

const gitHubID = process.env.GITHUB_OAuth_ID as string;
const gitHubSecret = process.env.GITHUB_OAuth_SECRET as string;

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
