import type { NextApiRequest, NextApiResponse } from "next";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.status(200).json({ message: "Authorized", data: req.decoded });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

export default apiAuth(handler, ["Admin"]);
