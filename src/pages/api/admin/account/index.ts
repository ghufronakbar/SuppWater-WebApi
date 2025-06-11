import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/config/db";
import apiAuth from "@/middleware/api-auth";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "@/constants";
import jwt from "jsonwebtoken";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case "GET":
        return await GET(req, res);
      case "PUT":
        return await PUT(req, res);
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

// GET PROFILE
async function GET(req: NextApiRequest, res: NextApiResponse) {
  const userId = await req.decoded?.id;
  const user = await db.user.findFirst({
    where: { id: userId },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      products: {
        where: {
          isDeleted: false,
        },
      },
    },
  });
  if (!user) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }
  return res.status(200).json({ message: "Success", data: user });
}

// EDIT PROFILE
async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, picture } = req.body;
  const userId = req.decoded?.id;
  if (!name || !email) {
    return res.status(400).json({ message: "Harap isi semua field" });
  }
  const re =
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!re.test(String(email).toLowerCase())) {
    return res.status(400).json({ message: "Email tidak valid" });
  }
  const checkEmail = await db.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (checkEmail && checkEmail.id !== userId) {
    return res.status(400).json({ message: "Email sudah terdaftar" });
  }
  const user = await db.user.update({
    where: { id: userId },
    data: { email, name, picture: picture || null },
  });
  const accessToken = jwt.sign(user, JWT_SECRET);

  return res.status(200).json({
    message: "Berhasil mengedit profile",
    data: { ...user, accessToken },
  });
}

// CHANGE PASSWORD
async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Harap isi semua field" });
  }
  const user = await db.user.findFirst({ where: { id: req.decoded?.id } });
  if (!user) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }
  const check = await bcrypt.compare(oldPassword, user.password);
  if (!check) {
    return res.status(400).json({ message: "Password lama salah" });
  }
  const hashedPass = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: req.decoded?.id },
    data: { password: hashedPass },
  });
  return res.status(200).json({ message: "Berhasil mengganti password" });
}

export default apiAuth(handler, ["Admin"]);
