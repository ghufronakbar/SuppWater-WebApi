import type { NextApiRequest, NextApiResponse } from "next";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({});
}

export default apiAuth(handler, ["Admin"]);
