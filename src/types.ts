import { ObjectId } from "mongoose";

type User = {
  gitHubId?: number;
  name: string;
  avatarURL?: string;
  token?: string;
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

type Session = {
  token: string;
  userId: ObjectId;
};

export type {
  User,
  UsersResponse,
  RepoResponse,
  ResponseError,
  UsersData,
  RepoData,
  Response,
  Session,
};
