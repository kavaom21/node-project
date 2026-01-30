import fs from "fs";
import path from "path";
import { authMiddleware } from "../middelwares/index.js";

const routeArray = (routes, router) => {
  routes.forEach((route) => {
    const method = route.method;         // "get", "post"
    const routePath = route.path;        // "/login"
    const controller = route.controller;
    const validation = route.validation;
    const isPublic = route.isPublic ?? false;
    const middleware = route.middleware; // Custom middleware array

    let middlewares = [];

    // Attach auth ONLY for private APIs
    if (!isPublic) {
      middlewares.push(authMiddleware());
    }

    // Attach validation (if exists)
    if (validation) {
      Array.isArray(validation)
        ? middlewares.push(...validation)
        : middlewares.push(validation);
    }

    // Attach custom middleware (for file upload)
    if (middleware) {
      middlewares.push(...middleware);
    }

    //  Controller
    middlewares.push(controller);

    //   express call
    router[method](routePath, ...middlewares);
  });

  return router;
};

export default {
  routeArray
};


// Response helper functions
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


// Upload utility functions
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

// Base64 image utility for raw JSON uploads
export const saveBase64Image = (base64String, folderName) => {
  if (!base64String) return null;
  
  // Extract base64 data (remove data:image/xxx;base64, prefix if exists)
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  
  // Generate unique filename
  const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = ".png"; // Default extension
  const fileName = uniqueName + ext;
  
  // Ensure folder exists and save file
  const uploadPath = ensureUploadDir(folderName);
  const filePath = path.join(uploadPath, fileName);
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);
  
  return fileName; // Return only filename
};

export const deleteBase64Image = (fileName, folderName) => {
  if (!fileName) return;
  const filePath = path.join("uploads", folderName, fileName);
  deleteFile(filePath);
};


