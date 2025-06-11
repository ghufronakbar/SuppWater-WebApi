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
      case "PATCH":
        return await PATCH(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

// GET ONE SELLER ORDER BY ID
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = await req.decoded?.id;
  const order = await db.order.findUnique({
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

  if (order.orderItems?.[0]?.product?.userId !== userId) {
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

// UPDATE ORDER STATUS (ONLY ITS SELLER CAN UPDATE ORDER STATUS)
async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = await req.decoded?.id;
  const order = await db.order.findUnique({
    where: { id },
    select: {
      user: true,
      status: true,
      orderItems: {
        select: {
          product: {
            select: {
              userId,
            },
          },
        },
      },
    },
  });
  if (!order) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  if (order.status === "Selesai") {
    return res.status(400).json({ message: "Pesanan sudah selesai" });
  }

  if (order.status === "Dibatalkan") {
    return res.status(400).json({ message: "Pesanan sudah dibatalkan" });
  }

  if (order.status === "Pending") {
    return res
      .status(400)
      .json({ message: "Menunggu pembayaran oleh pengguna" });
  }

  if (order.status === "Dikirim") {
    return res.status(400).json({ message: "Pesanan sudah dikirim" });
  }

  if (order.orderItems?.[0]?.product?.userId !== userId)
    return res.status(404).json({ message: "Data tidak ditemukan" });

  await db.order.update({
    where: { id },
    data: {
      status: "Dikirim",
    },
  });
  return res
    .status(200)
    .json({ message: "Pesanan berhasil ditandai sebagai dikirim" });
}

export default apiAuth(handler, ["Seller"]);
