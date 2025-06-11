import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminId = req.decoded?.id;
    // Fetch admin info
    const admin = await db.user.findFirst({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        createdAt: true,
      },
    });
    if (!admin) return res.status(404).json({ message: "Data tidak ditemukan" });

    // Fetch users (not admin)
    const users = await db.user.findMany({
      where: { role: { not: "Admin" } },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        role: true,
        createdAt: true,
      },
    });

    // Fetch products
    const products = await db.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch orders
    const orders = await db.order.findMany({
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
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalUsers = users.filter((u) => u.role === "User").length;
    const totalSellers = users.filter((u) => u.role === "Seller").length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalTransactions = transactions.length;

    // User role breakdown
    const userRoleCount = { User: 0, Seller: 0 };
    users.forEach((u) => {
      if (u.role === "User" || u.role === "Seller") userRoleCount[u.role]++;
    });

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
        admin,
        users,
        products,
        orders,
        transactions,
        stats: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalOrders,
          totalTransactions,
          userRoleCount,
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

export default apiAuth(handler, ["Admin"]);
