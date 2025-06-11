import type { NextApiRequest, NextApiResponse } from "next";
import apiAuth from "@/middleware/api-auth";
import db from "@/config/db";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.decoded?.id;
  const orders = await db.order.findMany({
    where: {
      userId,
    },
    select: {
      status: true,
    },
  });
  const data = {
    pendingOrders: orders.filter((order) => order.status === "Pending").length,
    completedOrders: orders.filter((order) => order.status === "Selesai")
      .length,
    waitingOrders: orders.filter((order) => order.status === "Dibayar").length,
  };
  return res.status(200).json({ message: "Success", data });
}

export default apiAuth(handler, ["User"]);
