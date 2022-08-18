import { List, Typography, Input, Button } from "antd";
import { useState, useRef, useCallback, ReactElement } from "react";
import { CloseOutlined } from "@ant-design/icons";

import { MAX_USERS } from "../const";
import { User, UsersResponse } from "../types";

import type { NextPage, NextApiRequest } from "next";

interface HomeProps {
  users: User[];
  userNickname: string;
}

const DOMAIN = process.env.VERCEL_URL || "localhost:3000";

const Home: NextPage<HomeProps> = ({ userNickname, users }: HomeProps) => {
  const [nickname, setNickname] = useState<string>(userNickname);
  const [usersData, setUsersData] = useState<User[]>(users);
  const [isInputEmpty, setisInputEmpty] = useState<boolean>(true);
  const nicknameInput = useRef<Input>(null);

  const handleButtonClick = useCallback(async (): Promise<void> => {
    const newNickname = nicknameInput.current?.input.value;
    const responseJSON = await fetch(`/api/lobby`, {
      method: "POST",
      body: JSON.stringify(newNickname),
    });

    const response = await responseJSON.json();
    if (response.error) {
      alert(response.error);
      return;
    }

    setUsersData(response.users);
    setNickname(response.userNickname);
  }, []);

  const handleInputChange = useCallback(() => {
    const isEmpty = !nicknameInput.current?.input.value;
    setisInputEmpty(isEmpty);
  }, []);

  const handleOutButtonClick = useCallback(async () => {
    const responseJSON = await fetch(`/api/lobby`, {
      method: "DELETE",
      body: JSON.stringify(nickname),
    });

    const response = await responseJSON.json();
    if (response.error) {
      alert(response.error);
      return;
    }

    setUsersData(response.users);
    setNickname("");
  }, []);

  const renderJoinButton = () => {
    return (
      <Button
        value={nickname}
        disabled={isInputEmpty}
        type="primary"
        onClick={handleButtonClick}
      >
        Join to lobby
      </Button>
    );
  };

  const renderRoomFooter = () => {
    return (
      <Input.Group compact style={{ display: "flex" }}>
        <Input
          ref={nicknameInput}
          placeholder="enter nickname"
          onChange={handleInputChange}
        />
        {usersData.length < MAX_USERS ? renderJoinButton() : ""}
      </Input.Group>
    );
  };

  const renderUserRow = ({ name }: User): ReactElement => {
    const isCurrentUser = name === nickname;

    return (
      <List.Item>
        <Typography.Text mark>
          {isCurrentUser ? `${name}(you)` : name}
        </Typography.Text>
        {isCurrentUser ? (
          <Button type="primary" danger onClick={handleOutButtonClick}>
            <CloseOutlined />
          </Button>
        ) : null}
      </List.Item>
    );
  };

  return (
    <List
      locale={{ emptyText: "empty" }}
      header={<div>Lobby</div>}
      footer={!nickname ? renderRoomFooter() : ""}
      bordered
      dataSource={usersData}
      renderItem={(user) => renderUserRow(user)}
    />
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const res = await fetch(`http://${DOMAIN}/api/lobby`);
  const usersResponse: UsersResponse = await res.json();
  const { users } = usersResponse;

  const isUserInRoom = !!users.find(
    ({ name }) => name === req.cookies.nickname
  );
  const userNickname = isUserInRoom ? req.cookies.nickname : null;

  return { props: { userNickname, users } };
}

export default Home;
