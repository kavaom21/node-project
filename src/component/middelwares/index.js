import jwt from "jsonwebtoken";
import config from "../../../config/index.js";
import { validationMiddleware } from "./validation.js";

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

      try {
        jwt.verify(token, config.ACCESS_TOKEN_SECRET);
      } catch (err) {
        return res.status(401).json({
          success: 0,
          message: "Invalid token"
        });
      }

      const decoded = jwt.decode(token);

      if (!decoded) {
        return res.status(401).json({
          success: 0,
          message: "Token decode failed"
        });
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        return res.status(401).json({
          success: 0,
          message: "Token expired"
        });
      }

      req.headers.userid = decoded.userId;
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      res.status(401).json({
        success: 0,
        message: "Invalid or expired token"
      });
    }
  };
};

