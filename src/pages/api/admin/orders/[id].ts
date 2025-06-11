import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";
import { midtransCheck } from "@/utils/midtrans";

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

// GET ORDER BY ID
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const order = await db.order.findFirst({
    where: { id },
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
  });
  if (!order) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  if (order.status === "Pending") {
    try {
      const mtCheck = await midtransCheck(order.id);
      if (mtCheck instanceof Error) {
        return res.status(500).json({ message: "Terjadi kesalahan sistem" });
      }
      const { transaction_status, status_code, settlement_time } = mtCheck;

      if (
        status_code &&
        transaction_status &&
        settlement_time &&
        status_code === "200" &&
        transaction_status === "settlement"
      ) {
        const order = await db.order.update({
          where: { id },
          data: {
            status: "Dibayar",
          },
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
        });
        return res.status(200).json({ message: "Success", data: order });
      }
    } catch (error) {
      console.log(error);
    }
  }
  return res.status(200).json({ message: "Success", data: order });
}

export default apiAuth(handler, ["Admin"]);
