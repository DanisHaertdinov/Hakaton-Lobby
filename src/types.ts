type User = {
  name: string;
};

type UsersResponse = {
  users: User[];
  userNickname?: string;
};

type RepoResponse = {
  url: string;
};

export type { User, UsersResponse, RepoResponse };
