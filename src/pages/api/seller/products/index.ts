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

// GET ALL SELLER PRODUCT
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const userId = await req.decoded?.id;
  const products = await db.product.findMany({
    include: {
      user: true,
    },
    where: {
      AND: [
        {
          userId,
        },
        {
          isDeleted: false,
        },
      ],
    },
  });
  return res.status(200).json({ message: "Success", data: products });
}

// CREATE SELLER PRODUCT
async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { name, desc, price, images } = req.body;
  const userId = await req.decoded?.id;

  if (!name || !desc || !price || !images) {
    return res.status(400).json({ message: "Harap isi semua field" });
  }

  if (typeof images !== "object") {
    return res.status(400).json({ message: "Gambar harus berupa array" });
  }

  if (!Array.isArray(images)) {
    return res.status(400).json({ message: "Gambar harus berupa array" });
  }
  if (!images.length) {
    return res.status(400).json({ message: "Gambar harus berupa array" });
  }
  images.forEach((element) => {
    if (typeof element !== "string") {
      return res.status(400).json({ message: "Gambar harus berupa array" });
    }
  });

  const product = await db.product.create({
    data: {
      name,
      desc,
      price,
      images,
      userId,
    },
  });

  return res
    .status(201)
    .json({ message: "Berhasil membuat produk", data: product });
}

export default apiAuth(handler, ["Seller"]);
