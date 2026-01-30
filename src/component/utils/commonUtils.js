import fs from "fs";
import path from "path";
import { authMiddleware, adminAuthMiddleware } from "../middelwares/index.js";

/* ===========================
   ROUTE ARRAY HANDLER
=========================== */

const routeArray = (routes, router) => {
  routes.forEach((route) => {
    const method = route.method;         // get | post | put | delete
    const routePath = route.path;        // "/login", "/admin/users"
    const controller = route.controller;
    const validation = route.validation;
    const isPublic = route.isPublic ?? false;
    const middleware = route.middleware;

    let middlewares = [];

    // 🔐 AUTH HANDLING (USER vs ADMIN)
    if (!isPublic) {
      if (routePath.startsWith("/admin")) {
        middlewares.push(adminAuthMiddleware());
      } else {
        middlewares.push(authMiddleware());
      }
    }

    // ✅ Validation middleware
    if (validation) {
      Array.isArray(validation)
        ? middlewares.push(...validation)
        : middlewares.push(validation);
    }

    // ✅ Custom middleware (multer, etc.)
    if (middleware) {
      middlewares.push(...middleware);
    }

    // 🎯 Controller
    middlewares.push(controller);

    // 🚀 Register route
    router[method](routePath, ...middlewares);
  });

  return router;
};

export default {
  routeArray
};

/* ===========================
   RESPONSE HELPERS
=========================== */

export const sendSuccess = (req, res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: 1,
    ...data
  });
};

export const sendError = (req, res, message, statusCode = 422) => {
  return res.status(statusCode).json({
    success: 0,
    message
  });
};

export const formattedErrors = (errors) => {
  const result = {};
  for (const field in errors) {
    result[field] = errors[field][0];
  }
  return result;
};

/* ===========================
   FILE / UPLOAD UTILITIES
=========================== */

export const ensureUploadDir = (folderName) => {
  const uploadPath = path.join("uploads", folderName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
};

export const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getFileName = (filePath) => {
  if (!filePath) return null;
  return path.basename(filePath);
};

export const cleanUploadedFiles = (files) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => {
    if (file && file.path) {
      deleteFile(file.path);
    }
  });
};

/* ===========================
   BASE64 IMAGE UTILITIES
=========================== */

export const saveBase64Image = (base64String, folderName) => {
  if (!base64String) return null;

  const base64Data = base64String.replace(
    /^data:image\/\w+;base64,/,
    ""
  );

  const uniqueName =
    Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileName = uniqueName + ".png";

  const uploadPath = ensureUploadDir(folderName);
  const filePath = path.join(uploadPath, fileName);

  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);

  return fileName;
};

export const deleteBase64Image = (fileName, folderName) => {
  if (!fileName) return;
  const filePath = path.join("uploads", folderName, fileName);
  deleteFile(filePath);
};
