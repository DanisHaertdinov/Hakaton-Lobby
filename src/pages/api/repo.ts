import { Octokit } from "octokit";
import { customAlphabet } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import { RepoData, RepoResponse, ResponseError } from "../../types";
import { generateResponse as baseGenerateResponse } from "../../utils/api";
import { gitHubToken, vercelToken } from "../../config";

type VercelProject = {
  name: string;
  repo?: string;
  type?: string;
  repoId?: number;
  ref?: string;
};

const nanoid = customAlphabet("1234567890", 7);

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

const generateResponse = ({
  data,
  error,
}: {
  data?: RepoData;
  error?: ResponseError;
}): RepoResponse => {
  const defaultResponse = { url: "" };
  const externalData = data ?? {};

  return baseGenerateResponse<RepoData>(
    { ...defaultResponse, ...externalData },
    error
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RepoResponse>
) {
  if (req.method === "DELETE") {
    cacheUrl = "";
    return res.status(200).json(generateResponse({ data: { url: "" } }));
  }

  if (req.method === "GET") {
    const response = { url: cacheUrl };

    return res.status(200).json(generateResponse({ data: response }));
  }

  if (req.method === "POST") {
    try {
      if (cacheUrl) {
        const response = { url: cacheUrl };

        return res.status(200).json(generateResponse({ data: response }));
      }

      const {
        data: { full_name: repo, name, default_branch: ref },
      } = await createRepo();

      const {
        name: projName,
        link: { repoId, type },
      } = await createVercelProj({ name, repo });

      const vercelDeployResponse = await deployVercelProj({
        name: projName,
        repoId,
        type,
        ref,
      });

      const {
        alias: [url],
      } = vercelDeployResponse;

      const response = { url };
      cacheUrl = url;

      return res.status(200).json(generateResponse({ data: response }));
    } catch (error) {
      return res.status(200).json(
        generateResponse({
          error: {
            error: "Something went wrong",
          },
        })
      );
    }
  }
}
