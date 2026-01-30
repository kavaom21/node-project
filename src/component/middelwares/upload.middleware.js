import multer from "multer";
import path from "path";
import { ensureUploadDir } from "../utils/commonUtils.js";


 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const moduleName = req.moduleName || "general";
    const folder = ensureUploadDir(moduleName);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});


const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

export default upload;

// Export individual upload configurations for flexibility
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

