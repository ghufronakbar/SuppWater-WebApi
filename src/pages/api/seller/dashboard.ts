import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.decoded?.id;
    // Fetch user info
    const user = await db.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "Data tidak ditemukan" });

    // Fetch products
    const products = await db.product.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch orders
    const orders = await db.order.findMany({
      where: {
        orderItems: {
          every: {
            product: { userId },
          },
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalTransactions = transactions.length;
    const totalBalance = transactions.reduce((acc, t) => t.type === "Pemasukan" ? acc + t.amount : acc - t.amount, 0);

    // Order status breakdown
    const orderStatusCount = {
      Pending: 0,
      Dibayar: 0,
      Dikirim: 0,
      Selesai: 0,
      Dibatalkan: 0,
    };
    orders.forEach((order) => {
      if (order.status in orderStatusCount) orderStatusCount[order.status]++;
    });

    // Recent orders and transactions
    const recentOrders = orders.slice(0, 5);
    const recentTransactions = transactions.slice(0, 5);

    // Product stats (top selling, etc. - placeholder for now)
    // You can expand this with more analytics if needed

    return res.status(200).json({
      message: "Success",
      data: {
        user,
        products,
        orders,
        transactions,
        stats: {
          totalProducts,
          totalOrders,
          totalTransactions,
          totalBalance,
          orderStatusCount,
        },
        recentOrders,
        recentTransactions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
}

export default apiAuth(handler, ["Seller"]);
