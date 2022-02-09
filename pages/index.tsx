import type { NextPage } from "next";
import { List, Typography, Input, Button } from "antd";
import { useState, ChangeEvent } from "react";

type User = {
  name: string;
};

interface props {
  users: User[];
}
const Home: NextPage<props> = ({ users }: props) => {
  const [nickname, setNickname] = useState<string>("");
  const [usersData, setUsersData] = useState<User[]>(users);

  const handleButtonClick = async (nickname: string): Promise<void> => {
    const response = await fetch("http://localhost:3000/api/hello", {
      method: "POST",
      body: JSON.stringify(nickname),
    });
    const updatedUsers: User[] = await response.json();

    setUsersData(updatedUsers);
    setNickname("");
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setNickname(event.target.value);
  };

  return (
    <List
      locale={{ emptyText: "empty" }}
      header={<div>Lobby</div>}
      footer={
        <Input.Group compact style={{ display: "flex" }}>
          <Input placeholder="enter nickname" onChange={handleInput} />
          <Button
            value={nickname}
            disabled={!nickname}
            type="primary"
            onClick={() => handleButtonClick(nickname)}
          >
            Join to lobby
          </Button>
        </Input.Group>
      }
      bordered
      dataSource={usersData}
      renderItem={(user) => (
        <List.Item>
          <Typography.Text mark>{user.name}</Typography.Text>
        </List.Item>
      )}
    />
  );
};

export async function getServerSideProps() {
  const res = await fetch(`http://localhost:3000/api/hello`);
  const users = await res.json();

  return { props: { users } };
}

export default Home;
