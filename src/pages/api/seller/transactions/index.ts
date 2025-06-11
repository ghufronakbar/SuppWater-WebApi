import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case "GET":
        return await GET(req, res);
      case "POST":
        return await POST(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

// GET ALL SELLER TRANSACTION
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.decoded?.id;
  const transactions = await db.transaction.findMany({
    include: {
      user: true,
    },
    where: {
      userId,
    },
  });
  return res.status(200).json({ message: "Success", data: transactions });
}

// Membuat Pencairan Seller
async function POST(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.decoded?.id;
  const { amount } = req.body;

  if (typeof amount !== "number") {
    return res.status(400).json({ message: "Harap isi semua field" });
  }

  const transactions = await db.transaction.findMany({
    select: {
      amount: true,
      type: true,
    },
    where: {
      userId,
    },
  });

  let total = 0;
  for (const transaction of transactions) {
    if (transaction.type === "Pemasukan") {
      total += transaction.amount;
    } else {
      total -= transaction.amount;
    }
  }

  if (amount > total) {
    return res.status(400).json({ message: "Saldo tidak cukup" });
  }

  const data = await db.transaction.create({
    data: {
      amount,
      type: "Pencairan",
      userId,
    },
  });

  return res.status(200).json({ message: "Success", data });
}

export default apiAuth(handler, ["Seller"]);
