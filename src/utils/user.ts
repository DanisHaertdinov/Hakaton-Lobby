import { Octokit } from "octokit";

export const getUserById = async (id: string) => {
  const octokit = new Octokit({
    auth: id,
  });

  const {
    data: { login: name, avatar_url: avatarURL },
  } = await octokit.request("GET /user");

  return {
    name,
    avatarURL,
  };
};
