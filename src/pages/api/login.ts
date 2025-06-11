import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import db from "@/config/db";
import { JWT_SECRET } from "@/constants";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: 400, message: "Harap isi email dan password" });
    }
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "User tidak ditemukan" });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(401).json({ status: 401, message: "Password salah" });
    }
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    return res.status(200).json({
      status: 200,
      message: "Berhasil login",
      data: { ...user, accessToken },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
}
