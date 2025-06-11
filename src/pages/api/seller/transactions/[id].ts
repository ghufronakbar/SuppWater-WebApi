import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case "GET":
        return await GET(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

// GET ONE SELLER TRANSACTION
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = req.decoded?.id;
  const transaction = await db.transaction.findFirst({
    where: { id },
    include: {
      user: true,
    },
  });
  if (!transaction) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }
  if (transaction.userId !== userId) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  return res.status(200).json({ message: "Success", data: transaction });
}

export default apiAuth(handler, ["Seller"]);
