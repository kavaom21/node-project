import jwt from "jsonwebtoken";
import config from "../../../config/index.js";
import { validationMiddleware } from "./validation.js";


export const adminAuthMiddleware = () => {
  return (req, res, next) => {

    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({  message: "No token" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

      if (decoded.role !== "admin") {
        return res.status(403).json({  message: "Admin access only" });
      }

      req.headers.adminid = decoded.adminId;
      next();


    } catch (err) {
      return res.status(401).json({ success: 0, message: "Invalid token" });
    }
  };
};


export { validationMiddleware };

export const authMiddleware = () => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: 0,
          message: "Authorization header is missing"
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: 0,
          message: "Token is missing"
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
      } catch (err) {
        return res.status(401).json({
          success: 0,
          message: "Invalid token"
        });
      }

      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: 0,
          message: "Token decode failed"
        });
      }

      req.headers.userid = decoded.userId;
      next();

    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({
        success: 0,
        message: "Invalid or expired token"
      });
    }
  };
};

