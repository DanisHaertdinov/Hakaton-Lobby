import type { NextPage } from "next";
import { List, Typography, Input, Button } from "antd";
import { useState, ChangeEvent } from "react";
import { MAX_USERS } from "../src/const";
import { User } from "../src/types";

interface props {
  users: User[];
}

const DOMAIN = process.env.SITE_URL || "http://localhost:3000";

const Home: NextPage<props> = ({ users }: props) => {
  const [nickname, setNickname] = useState<string>("");
  const [usersData, setUsersData] = useState<User[]>(users);

  const handleButtonClick = async (nickname: string): Promise<void> => {
    const responseJSON = await fetch(`/api/hello`, {
      method: "POST",
      body: JSON.stringify(nickname),
    });

    const response = await responseJSON.json();
    if (response.error) {
      console.log(response.error);
      return;
    }

    setUsersData(response);
    setNickname("");
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setNickname(event.target.value);
  };

  const renderJoinButton = () => {
    return (
      <Button
        value={nickname}
        disabled={!nickname}
        type="primary"
        onClick={() => handleButtonClick(nickname)}
      >
        Join to lobby
      </Button>
    );
  };

  return (
    <List
      locale={{ emptyText: "empty" }}
      header={<div>Lobby</div>}
      footer={
        <Input.Group compact style={{ display: "flex" }}>
          <Input
            value={nickname}
            placeholder="enter nickname"
            onChange={handleInput}
          />
          {usersData.length < MAX_USERS ? renderJoinButton() : ""}
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
  const res = await fetch(`${DOMAIN}/api/hello`);
  const users = await res.json();
  console.error(process.env.VERCEL_URL);
  console.error(process.env.SITE_URL);

  return { props: { users } };
}

export default Home;
