import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getUserById } from "../../../utils/user";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const { id } = req.query as { id: string };
  const user = await getUserById(id);

  return res.status(200).json(user);
});

export default router.handler();
