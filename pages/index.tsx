import type { NextPage } from "next";
import { List, Typography, Input, Button } from "antd";
import { useState, ChangeEvent } from "react";
import { MAX_USERS } from "./const";
import { User } from "./types";

interface props {
  users: User[];
}

const Home: NextPage<props> = ({ users }: props) => {
  const [nickname, setNickname] = useState<string>("");
  const [usersData, setUsersData] = useState<User[]>(users);

  const handleButtonClick = async (nickname: string): Promise<void> => {
    const responseJSON = await fetch("http://localhost:3000/api/hello", {
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
  const res = await fetch(`http://localhost:3000/api/hello`);
  const users = await res.json();

  return { props: { users } };
}

export default Home;
