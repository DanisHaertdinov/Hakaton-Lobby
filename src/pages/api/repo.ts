import { Octokit } from "octokit";
import { customAlphabet } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

import { RepoResponse } from "../../types";

type VercelProject = {
  name: string;
  repo?: string;
  type?: string;
  repoId?: number;
  ref?: string;
};

const nanoid = customAlphabet("1234567890", 7);

const gitHubToken = process.env.HACK_LOBBY_GITHUB_TOKEN;
const vercelToken = process.env.HACK_LOBBY_VERCEL_TOKEN;
const octokit = new Octokit({
  auth: gitHubToken,
});

let cacheUrl = "";

const createRepo = () => {
  return octokit.request(
    "POST /repos/{template_owner}/{template_repo}/generate",
    {
      template_owner: "hackLobby",
      template_repo: "next-test",
      owner: "hackLobby",
      name: `hack-lobby-${nanoid()}`,
      description: "This is your first repository",
      include_all_branches: false,
      private: false,
    }
  );
};

const createVercelProj = async ({ name, repo }: VercelProject) => {
  return (
    await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + vercelToken,
      },
      body: JSON.stringify({
        name,
        framework: "nextjs",
        gitRepository: {
          repo,
          type: "github",
        },
      }),
    })
  ).json();
};

const deployVercelProj = async ({ name, type, repoId, ref }: VercelProject) => {
  return (
    await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + vercelToken,
      },
      body: JSON.stringify({
        name,
        gitSource: {
          type,
          repoId,
          ref,
        },
      }),
    })
  ).json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RepoResponse | Error>
) {
  console.log(gitHubToken);

  if (req.method === "DELETE") {
    cacheUrl = "";
    return res.status(200).json({ url: "" });
  }

  if (req.method === "GET") {
    const response = { url: cacheUrl };

    return res.status(200).json(response);
  }

  if (req.method === "POST") {
    if (cacheUrl) {
      const response = { url: cacheUrl };

      return res.status(200).json(response);
    }

    const {
      data: { full_name: repo, name, default_branch: ref },
    } = await createRepo();

    const {
      name: projName,
      link: { repoId, type },
    } = await createVercelProj({ name, repo });

    const {
      alias: [url],
    } = await deployVercelProj({ name: projName, repoId, type, ref });

    const response = { url };
    cacheUrl = url;

    return res.status(200).json(response);
  }
}
