import { List, Typography, Input, Button, Row, Avatar } from "antd";
import { useState, useRef, useCallback, ReactElement } from "react";
import { CloseOutlined, GithubOutlined } from "@ant-design/icons";
import Script from "next/script";

import { MAX_USERS } from "../const";
import { User, UsersResponse, RepoResponse } from "../types";
import { Iframe } from "../components/Iframe/Iframe";
import { load } from "../endpoints/load";
import { gitHubID } from "../config";

import type { NextPage, NextApiRequest } from "next";

interface HomeProps {
  users: User[];
  userNickname: string;
  url: string;
  lobbyName: string;
  user: User;
}

const Home: NextPage<HomeProps> = ({
  userNickname,
  users,
  url,
  lobbyName,
  user,
}: HomeProps) => {
  const [nickname, setNickname] = useState<string>(userNickname);
  const [usersData, setUsersData] = useState<User[]>(users);
  const [isInputEmpty, setisInputEmpty] = useState<boolean>(true);
  const [repUrl, setRepUrl] = useState<string>(url);
  const [isPending, setIsPending] = useState<boolean>(false);
  const nicknameInput = useRef<Input>(null);
  const jitsi = useRef<HTMLDivElement>(null);

  const handleButtonClick = useCallback(async (): Promise<void> => {
    const newNickname = nicknameInput.current?.input.value;

    const { error, data } = await load<UsersResponse>({
      endpoint: "/lobby",
      method: "POST",
      body: { userName: newNickname },
    });

    if (error) {
      alert(error);
      return;
    }

    setUsersData(data.users);
    setNickname(data.userNickname || "");
  }, []);

  const handleInputChange = useCallback(() => {
    const isEmpty = !nicknameInput.current?.input.value;
    setisInputEmpty(isEmpty);
  }, []);

  const handleOutButtonClick = useCallback(async () => {
    const { error, data } = await load<UsersResponse>({
      endpoint: "/lobby",
      method: "DELETE",
      body: { userName: nickname },
    });

    if (error) {
      alert(error);
      return;
    }

    setUsersData(data.users);
    setNickname("");
  }, [nickname]);

  const handleStartButtonCLick = useCallback(async () => {
    setIsPending(true);

    const { data, error } = await load<RepoResponse>({
      endpoint: "/repo",
      method: "POST",
      body: {},
    });

    if (error) {
      alert(error);
    } else {
      setRepUrl(data.url);
    }

    setIsPending(false);
  }, []);

  const handleResetButtonClick = async () => {
    const reset = true;

    await Promise.all([
      load<RepoResponse>({
        endpoint: "/repo",
        method: "DELETE",
        body: { reset },
      }),
      load<UsersResponse>({
        endpoint: "/lobby",
        method: "DELETE",
        body: { reset },
      }),
    ]);

    setRepUrl("");
    setNickname("");
    setUsersData([]);
  };

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

  const renderStartButton = () => {
    if (repUrl) {
      return null;
    }

    return (
      <Button
        onClick={handleStartButtonCLick}
        block
        size={"large"}
        style={{ background: "green", borderColor: "green", color: "white" }}
        disabled={!!url || isPending}
      >
        Start
      </Button>
    );
  };

  const renderUserBadge = () => {
    const { avatarURL, name } = user;
    return (
      <>
        <Avatar src={avatarURL} />
        <span>{name}</span>
      </>
    );
  };

  const handeJitsiLoad = () => {
    const domain = "meet.jit.si";
    const options = {
      roomName: lobbyName,
      width: 720,
      height: 420,
      parentNode: jitsi.current,
      lang: "ru",
      configOverwrite: {
        prejoinPageEnabled: false,
      },
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const api = new JitsiMeetExternalAPI(domain, options);
    api.executeCommand("displayName", nickname);
  };

  return (
    <main>
      <Row justify="end" align="top">
        {user ? (
          renderUserBadge()
        ) : (
          <Button
            type="link"
            href={`https://github.com/login/oauth/authorize?client_id=${gitHubID}`}
            size="large"
          >
            <GithubOutlined style={{ fontSize: "30px", color: "black" }} />
          </Button>
        )}
      </Row>
      <div className={repUrl ? "lobby" : ""}>
        {repUrl ? (
          <>
            <Script
              onLoad={handeJitsiLoad}
              src="https://meet.jit.si/external_api.js"
            />
            <div className={"jitsi"} ref={jitsi}></div>
          </>
        ) : null}

        <List
          locale={{ emptyText: "empty" }}
          header={<div>Lobby</div>}
          footer={!nickname ? renderRoomFooter() : renderStartButton()}
          bordered
          dataSource={usersData}
          renderItem={(user) => renderUserRow(user)}
          className={"lobby-list"}
        />
      </div>
      {repUrl ? <Iframe height={"520px"} width={"100%"} src={repUrl} /> : null}
      <Button onClick={handleResetButtonClick} danger={true}>
        Reset
      </Button>
    </main>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const userId = req.cookies.userId;

  const [
    {
      data: { users, lobbyName },
    },
    {
      data: { url },
    },
    user,
  ] = await Promise.all([
    load<UsersResponse>({ endpoint: "/lobby" }),
    load<RepoResponse>({ endpoint: "/repo" }),
    userId
      ? load<User>({ endpoint: `/user/${userId}` })
      : Promise.resolve(null),
  ]);

  const isUserInRoom = !!users.find(
    ({ name }) => name === req.cookies.nickname
  );
  const userNickname = isUserInRoom ? req.cookies.nickname : null;

  return { props: { userNickname, users, url, lobbyName, user } };
}

export default Home;
