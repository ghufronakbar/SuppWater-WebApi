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
      case "DELETE":
        return await DELETE(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

// GET USER ONE ORDER
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = req.decoded?.id;
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

  if (order.userId !== userId) {
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

// UPDATE ORDER STATUS (ONLY ITS USER CAN UPDATE ORDER STATUS TO "Selesai")
async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = await req.decoded?.id;
  const order = await db.order.findFirst({
    where: { id },
    select: {
      status: true,
      userId: true,
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

  if (order.status === "Dibayar") {
    return res
      .status(400)
      .json({ message: "Menunggu pengiriman oleh penjual" });
  }

  if (order.status === "Pending") {
    return res
      .status(400)
      .json({ message: "Harap melakukan pembayaran terlebih dahulu" });
  }

  if (order?.userId !== userId)
    return res.status(404).json({ message: "Data tidak ditemukan" });

  await db.order.update({
    where: { id },
    data: {
      status: "Selesai",
    },
  });
  return res
    .status(200)
    .json({ message: "Pesanan berhasil ditandai sebagai selesai" });
}

// UPDATE ORDER STATUS (ONLY ITS USER CAN UPDATE ORDER STATUS TO "Dibatalkan")
async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = await req.decoded?.id;
  const order = await db.order.findFirst({
    where: { id },
    select: {
      status: true,
      userId: true,
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

  if (order.status === "Dibayar") {
    return res
      .status(400)
      .json({ message: "Menunggu pengiriman oleh penjual" });
  }

  if (order.status === "Dikirim") {
    return res.status(400).json({ message: "Pesanan sudah dalam pengiriman" });
  }

  if (order?.userId !== userId)
    return res.status(404).json({ message: "Data tidak ditemukan" });

  await db.order.update({
    where: { id },
    data: {
      status: "Dibatalkan",
    },
  });
  return res.status(200).json({ message: "Berhasil membatalkan pesanan" });
}

export default apiAuth(handler, ["User"]);
