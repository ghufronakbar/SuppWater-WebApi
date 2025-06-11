import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";
import { midtransCheckout } from "@/utils/midtrans";

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

// GET USER ORDERS
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.decoded?.id;
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
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(200).json({ message: "Success", data: orders });
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.decoded?.id;
  const { latitude, longitude, location, orderItems } = req.body;
  if (!latitude || !longitude || !location || !orderItems) {
    return res.status(400).json({ message: "Harap isi semua field" });
  }
  if (typeof orderItems !== "object") {
    return res.status(400).json({ message: "Data tidak valid" });
  }
  if (!Array.isArray(orderItems)) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  const productIds: string[] = [];

  for (const orderItem of orderItems) {
    if (typeof orderItem !== "object") {
      return res.status(400).json({ message: "Data tidak valid" });
    }
    if (
      !orderItem.quantity ||
      !Number.isInteger(orderItem.quantity) ||
      orderItem.quantity < 1
    ) {
      return res.status(400).json({ message: "Kuantitas harus berupa angka" });
    }

    if (!orderItem.productId || typeof orderItem.productId !== "string") {
      return res.status(400).json({ message: "Id tidak valid" });
    }
    if (productIds.includes(orderItem.productId)) {
      return res.status(400).json({ message: "Terdapat produk yang sama" });
    }
    productIds.push(orderItem.productId);
  }

  const checkProducts = await db.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      isDeleted: true,
      price: true,
      id: true,
    },
  });
  if (checkProducts.length !== productIds.length) {
    return res.status(400).json({ message: "Produk tidak ditemukan" });
  }

  if (checkProducts.some((product) => product.isDeleted)) {
    return res.status(400).json({ message: "Produk tidak ditemukan" });
  }

  const sanitizedOrderItems: OrderItemDTO[] = [];

  for (const orderItem of orderItems) {
    const product = checkProducts.find(
      (product) => product.id === orderItem.productId
    );
    if (!product) {
      return res.status(400).json({ message: "Produk tidak ditemukan" });
    }
    sanitizedOrderItems.push({
      pricePerItem: product.price,
      productId: product.id,
      quantity: Number(orderItem.quantity),
      total: product.price * Number(orderItem.quantity),
    });
  }

  const total = sanitizedOrderItems.reduce(
    (acc, orderItem) => acc + orderItem.total,
    0
  );

  const order = await db.order.create({
    data: {
      location,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: "Pending",
      userId,
      total,
      orderItems: {
        createMany: {
          data: sanitizedOrderItems,
        },
      },
    },
  });

  const checkout = await midtransCheckout(order.id, total);
  if (checkout instanceof Error) {
    await db.order.delete({ where: { id: order.id } });
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }

  const createOrder = await db.order.update({
    where: { id: order.id },
    data: { mtRedirectUrl: checkout.redirect_url, mtSnapToken: checkout.token },
  });

  return res
    .status(200)
    .json({ message: "Berhasil membuat pesanan", data: createOrder });
}

export default apiAuth(handler, ["User"]);

interface OrderItemDTO {
  pricePerItem: number;
  productId: string;
  quantity: number;
  total: number;
}
