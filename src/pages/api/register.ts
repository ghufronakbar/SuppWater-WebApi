import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import db from "@/config/db";
import { JWT_SECRET } from "@/constants";
import bcrypt from "bcryptjs";
import { $Enums } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { email, password, role, name } = req.body;
    if (!email || !password || !role || !name) {
      return res
        .status(400)
        .json({ status: 400, message: "Harap isi semua data" });
    }
    if (role !== "Seller" && role !== "User") {
      return res.status(400).json({ status: 400, message: "Role tidak valid" });
    }
    const re =
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!re.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: "Email tidak valid" });
    }
    const check = await db.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (check) {
      return res
        .status(400)
        .json({ status: 400, message: "Email sudah terdaftar" });
    }
    const hashedPass = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPass,
        role: role as $Enums.Role,
        name,
      },
    });

    const accessToken = jwt.sign(user, JWT_SECRET);
    return res.status(200).json({
      status: 200,
      message: "Berhasil registrasi",
      data: { ...user, accessToken },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
}
