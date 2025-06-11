import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case "PUT":
        return await PUT(req, res);
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

// UPDATE SELLER PRODUCT
async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = req.decoded?.id;
  const { name, desc, price, images } = req.body;

  // Validasi dasar
  if (!name || !desc || !price || !images) {
    return res.status(400).json({ message: "Harap isi semua field" });
  }
  if (
    !Array.isArray(images) ||
    !images.length ||
    images.some((img) => typeof img !== "string")
  ) {
    return res
      .status(400)
      .json({ message: "Gambar harus berupa array string" });
  }

  // Cari produk
  const product = await db.product.findFirst({
    where: { id },
  });
  if (!product || product.isDeleted || product.userId !== userId) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  // Update produk
  const updated = await db.product.update({
    where: { id },
    data: { name, desc, price, images },
  });

  return res
    .status(200)
    .json({ message: "Produk berhasil diperbarui", data: updated });
}

// SOFT DELETE SELLER PRODUCT
async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const userId = req.decoded?.id;

  // Cari produk
  const product = await db.product.findFirst({
    where: { id },
  });
  if (!product || product.isDeleted || product.userId !== userId) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  // Soft delete (isDeleted + deletedAt)
  const deleted = await db.product.update({
    where: { id },
    data: { isDeleted: true },
  });

  return res
    .status(200)
    .json({ message: "Produk berhasil dihapus", data: deleted });
}

export default apiAuth(handler, ["Seller"]);
