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

// GET ALL ORDERS
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const orders = await db.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ message: "Success", data: orders });
}

export default apiAuth(handler, ["Admin"]);
