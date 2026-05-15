import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: string[] = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('"Only jpg, jpeg and png are allowed",'));
    }
  },
});
