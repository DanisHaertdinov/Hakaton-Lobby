import type { NextPage } from "next";
import { List, Typography, Input, Button } from "antd";
import { useState, useRef } from "react";
import { MAX_USERS } from "../src/const";
import { User, UsersResponse } from "../src/types";
import type { NextApiRequest } from "next";

interface props {
  users: User[];
  userNickname: string;
}

const DOMAIN = process.env.VERCEL_URL || "localhost:3000";

const Home: NextPage<props> = ({ userNickname, users }: props) => {
  const [nickname, setNickname] = useState<string>(userNickname);
  const [usersData, setUsersData] = useState<User[]>(users);
  const roomInput = useRef<Input>(null);

  const handleButtonClick = async (): Promise<void> => {
    const newNickname = roomInput.current?.input.value;
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
  };

  const renderJoinButton = () => {
    return (
      <Button
        value={nickname}
        // TODO: disable button if input is empty
        // disabled={!nickname}
        type="primary"
        onClick={() => handleButtonClick()}
      >
        Join to lobby
      </Button>
    );
  };

  const renderRoomFooter = () => {
    return (
      <Input.Group compact style={{ display: "flex" }}>
        <Input ref={roomInput} placeholder="enter nickname" />
        {usersData.length < MAX_USERS ? renderJoinButton() : ""}
      </Input.Group>
    );
  };

  return (
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
