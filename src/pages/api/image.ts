import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import cloudinary from "@/config/cloudinary";
import fs from "fs";
import { UploadApiResponse } from "cloudinary";
import { APP_NAME } from "@/constants";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({
        message: "Terjadi kesalahan sistem",
      });
    }

    const { image } = files;
    if (!image) {
      return res.status(500).json({
        message: "Harap upload gambar",
      });
    }

    const uploadToCloudinary = (): Promise<UploadApiResponse> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: APP_NAME },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              reject(error);
            } else {
              if (result) {
                resolve(result);
              }
            }
          }
        );

        const stream = fs.createReadStream(image[0].filepath);
        stream.pipe(uploadStream);
      });
    };

    try {
      const uploadResult = await uploadToCloudinary();

      return res.status(200).json({
        message: "Berhasil upload gambar",
        data: uploadResult,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengupload gambar",
      });
    }
  });
}

export default handler;
