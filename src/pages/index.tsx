import { List, Typography, Input, Button } from "antd";
import { useState, useRef, useCallback } from "react";

import { MAX_USERS } from "../const";
import { User, UsersResponse } from "../types";
import { Iframe } from "../components/Iframe/Iframe";

import type { NextPage, NextApiRequest } from "next";

interface HomeProps {
  users: User[];
  userNickname: string;
}
const IFRAME_URL = "https://next-test-rho-lake.vercel.app/";
const DOMAIN = process.env.VERCEL_URL || "localhost:3000";

const Home: NextPage<HomeProps> = ({ userNickname, users }: HomeProps) => {
  const [nickname, setNickname] = useState<string>(userNickname);
  const [usersData, setUsersData] = useState<User[]>(users);
  const [isInputEmpty, setisInputEmpty] = useState<boolean>(true);
  const nicknameInput = useRef<Input>(null);

  const handleButtonClick = useCallback(async (): Promise<void> => {
    const newNickname = nicknameInput.current?.input.value;
    const responseJSON = await fetch(`/api/hello`, {
      method: "POST",
      body: JSON.stringify(newNickname),
    });

    const response = await responseJSON.json();

    if (response.error) {
      console.log(response.error);
      return;
    }

    setUsersData(response.users);
    setNickname(response.userNickname);
  }, []);

  const handleInputChange = useCallback(() => {
    const isEmpty = !nicknameInput.current?.input.value;
    setisInputEmpty(isEmpty);
  }, []);

  const renderJoinButton = () => {
    return (
      <Button
        value={nickname}
        // TODO: disable button if input is empty
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

  return (
    <>
      <List
        locale={{ emptyText: "empty" }}
        header={<div>Lobby</div>}
        footer={!nickname ? renderRoomFooter() : ""}
        bordered
        dataSource={usersData}
        renderItem={(user) => (
          <List.Item>
            <Typography.Text mark>
              {user.name === nickname ? `${user.name}(you)` : user.name}
            </Typography.Text>
          </List.Item>
        )}
      />
      <Iframe height={"520px"} width={"100%"} src={IFRAME_URL} />
    </>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const res = await fetch(`http://${DOMAIN}/api/hello`);
  const usersResponse: UsersResponse = await res.json();
  const { users } = usersResponse;

  const isUserInRoom = !!users.find(
    ({ name }) => name === req.cookies.nickname
  );
  const userNickname = isUserInRoom ? req.cookies.nickname : null;

  return { props: { userNickname, users } };
}

export default Home;
