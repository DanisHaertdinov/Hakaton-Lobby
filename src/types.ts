type User = {
  name: string;
  avatarURL?: string;
};

type Response<T> = {
  data: T;
} & ResponseError;

type UsersData = {
  users: User[];
  userNickname?: string;
  lobbyName: string;
};

type UsersResponse = Response<UsersData>;

type RepoData = {
  url: string;
};

type RepoResponse = Response<RepoData>;

type ResponseError = {
  error?: string;
};

export type {
  User,
  UsersResponse,
  RepoResponse,
  ResponseError,
  UsersData,
  RepoData,
  Response,
};
