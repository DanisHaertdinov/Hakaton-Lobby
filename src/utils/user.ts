import { Octokit } from "octokit";

export const getUserByToken = async (token: string) => {
  const octokit = new Octokit({
    auth: token,
  });

  const {
    data: { login: name, avatar_url: avatarURL, id },
  } = await octokit.request("GET /user");

  return {
    name,
    avatarURL,
    gitHubId: id
  };
};
