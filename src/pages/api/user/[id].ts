import { createRouter } from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { getUserById } from "./User";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const { id } = req.query as { id: string };

  return res.status(200).json(await getUserById(id));
});

export default router.handler();
