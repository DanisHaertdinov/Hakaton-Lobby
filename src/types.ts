type User = {
  name: string;
};

type UsersResponse = {
  users: User[];
  userNickname?: string;
};

export type { User, UsersResponse };
// Check vercel deploy
