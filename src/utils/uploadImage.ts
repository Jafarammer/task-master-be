import cloudinary from "./cloudinary";
import streamifier from "streamifier";

export const uploadImageToCloudinary = async (file: Express.Multer.File) => {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "task-master/profile",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
